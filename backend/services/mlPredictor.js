/**
 * Real ML Predictor Service - TensorFlow.js
 * Forecasting Baltic Dry Index (BDRY ETF Proxy) for freight optimization.
 */
let tf;
try {
    tf = require('@tensorflow/tfjs-node');
} catch (e) {
    console.warn("Falling back to pure JS TensorFlow (tfjs) due to native binding error.");
    tf = require('@tensorflow/tfjs');
}
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();


// Memory Cache to prevent retraining on every API request
let cachedModel = null;
let dataMin = 0;
let dataMax = 1;
let latestMultivariateSequence = [];
let currentPrice = 0;
let historicalVolatility = 0;
const OUTLOOK_DAYS = 90;
const LOOKBACK_DAYS = 60; // Increased lookback to 60 days for deeper temporal context

// Feature normalization bounds
let bounds = {
    bdry: { min: 0, max: 1 },
    sp500: { min: 0, max: 1 },
    oil: { min: 0, max: 1 },
    sma14: { min: 0, max: 1 },
    rsi14: { min: 0, max: 1 }
};


/**
 * 1. Data Ingestion & Alignment: Fetch real multivariate data (BDRY, S&P500, Crude Oil)
 */
async function fetchRealData() {
    console.log("Fetching real multivariate historical data (BDRY, ^GSPC, CL=F)...");
    const period1 = new Date();
    period1.setFullYear(period1.getFullYear() - 5); // 5 years for balanced training speed
    
    const [bdryRaw, sp500Raw, oilRaw] = await Promise.all([
        yahooFinance.chart('BDRY', { period1, interval: '1d' }),
        yahooFinance.chart('^GSPC', { period1, interval: '1d' }),
        yahooFinance.chart('CL=F', { period1, interval: '1d' })
    ]);

    // Align data by date (inner join) to avoid look-ahead bias and mismatched sequences
    const dateMap = {};
    bdryRaw.quotes.forEach(q => { if (q.close) dateMap[q.date.toISOString().split('T')[0]] = { bdry: q.close }; });
    sp500Raw.quotes.forEach(q => { if (q.close && dateMap[q.date.toISOString().split('T')[0]]) dateMap[q.date.toISOString().split('T')[0]].sp500 = q.close; });
    oilRaw.quotes.forEach(q => { if (q.close && dateMap[q.date.toISOString().split('T')[0]]) dateMap[q.date.toISOString().split('T')[0]].oil = q.close; });

    // Filter out dates missing any of the 3 features
    const alignedData = Object.keys(dateMap).sort()
        .map(date => dateMap[date])
        .filter(d => d.bdry != null && d.sp500 != null && d.oil != null);

    return alignedData;
}

/**
 * Technical Indicators (DSA Optimized using Float32Array)
 */
function calculateRSI(prices, period = 14) {
    const rsi = new Float32Array(prices.length);
    let gain = 0, loss = 0;
    for (let i = 1; i <= period; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff > 0) gain += diff;
        else loss -= diff;
    }
    let avgGain = gain / period;
    let avgLoss = loss / period;
    rsi[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));

    for (let i = period + 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        avgGain = ((avgGain * (period - 1)) + (diff > 0 ? diff : 0)) / period;
        avgLoss = ((avgLoss * (period - 1)) + (diff < 0 ? -diff : 0)) / period;
        rsi[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
    }
    return rsi;
}

function calculateSMA(prices, period) {
    const sma = new Float32Array(prices.length);
    let sum = 0;
    for (let i = 0; i < prices.length; i++) {
        sum += prices[i];
        if (i >= period) sum -= prices[i - period];
        if (i >= period - 1) sma[i] = sum / period;
    }
    return sma;
}

/**
 * 2. Feature Engineering: Min-Max Scaling & Direct Multi-step Sequence Generation
 */
function prepareData(historicalData) {
    const bdryPrices = new Float32Array(historicalData.map(d => d.bdry));
    const rsi14 = calculateRSI(bdryPrices, 14);
    const sma14 = calculateSMA(bdryPrices, 14);

    // Merge engineered features back into the dataset
    for (let i = 0; i < historicalData.length; i++) {
        historicalData[i].rsi14 = rsi14[i] || 50; // default RSI neutral
        historicalData[i].sma14 = sma14[i] || historicalData[i].bdry;
    }

    // Calculate Bounds for Min-Max Scaling dynamically
    const featuresList = ['bdry', 'sp500', 'oil', 'sma14', 'rsi14'];
    featuresList.forEach(f => {
        bounds[f].min = Math.min(...historicalData.map(d => d[f]));
        bounds[f].max = Math.max(...historicalData.map(d => d[f]));
    });

    // Calculate historical volatility on BDRY (std dev of daily log returns) using Float32Array
    let returns = new Float32Array(historicalData.length - 1);
    let sumReturns = 0;
    for (let i = 1; i < historicalData.length; i++) {
        returns[i-1] = Math.log(historicalData[i].bdry / historicalData[i - 1].bdry);
        sumReturns += returns[i-1];
    }
    const meanReturn = sumReturns / returns.length;
    let varianceReturns = 0;
    for (let i = 0; i < returns.length; i++) {
        varianceReturns += Math.pow(returns[i] - meanReturn, 2);
    }
    historicalVolatility = Math.sqrt(varianceReturns / returns.length);

    // Normalize Multivariate Data
    const normalizedData = historicalData.map(d => [
        (d.bdry - bounds.bdry.min) / (bounds.bdry.max - bounds.bdry.min),
        (d.sp500 - bounds.sp500.min) / (bounds.sp500.max - bounds.sp500.min),
        (d.oil - bounds.oil.min) / (bounds.oil.max - bounds.oil.min),
        (d.sma14 - bounds.sma14.min) / (bounds.sma14.max - bounds.sma14.min),
        (d.rsi14 - bounds.rsi14.min) / (bounds.rsi14.max - bounds.rsi14.min)
    ]);

    latestMultivariateSequence = normalizedData.slice(-LOOKBACK_DAYS);
    currentPrice = historicalData[historicalData.length - 1].bdry;

    const features = [];
    const labels = [];
    
    // Create sliding windows for DIRECT Multi-step forecasting
    // Input: 60 days of 5 features (BDRY, SP500, OIL, SMA14, RSI14)
    // Output: Next 90 days of BDRY
    for (let i = LOOKBACK_DAYS; i <= normalizedData.length - OUTLOOK_DAYS; i++) {
        features.push(normalizedData.slice(i - LOOKBACK_DAYS, i));
        // The label is the next OUTLOOK_DAYS of purely the BDRY index (feature index 0)
        labels.push(normalizedData.slice(i, i + OUTLOOK_DAYS).map(d => d[0]));
    }
    
    // Chronological Train/Validation Split (85/15) - crucial for time series
    const splitIdx = Math.floor(features.length * 0.85);

    return {
        // X Shape: [batch_size, time_steps, features] -> [N, 60, 5]
        trainX: tf.tensor3d(features.slice(0, splitIdx), [splitIdx, LOOKBACK_DAYS, 5]),
        trainY: tf.tensor2d(labels.slice(0, splitIdx), [splitIdx, OUTLOOK_DAYS]),
        valX: tf.tensor3d(features.slice(splitIdx), [features.length - splitIdx, LOOKBACK_DAYS, 5]),
        valY: tf.tensor2d(labels.slice(splitIdx), [features.length - splitIdx, OUTLOOK_DAYS])
    };
}

/**
 * 3. Model Architecture & Training (CNN-LSTM Hybrid)
 */
async function trainModel(trainX, trainY, valX, valY) {
    const model = tf.sequential();
    
    // 1D CNN for spatial/local trend feature extraction
    model.add(tf.layers.conv1d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu',
        inputShape: [LOOKBACK_DAYS, 5]
    }));
    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
    
    // LSTM for long-term temporal dependencies
    model.add(tf.layers.lstm({
        units: 64,
        returnSequences: false
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 128, activation: 'relu', kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }) }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    // Direct Multi-step Output (90 neurons for 90 days)
    // This avoids autoregressive error accumulation entirely.
    model.add(tf.layers.dense({ units: OUTLOOK_DAYS, activation: 'linear' }));

    // Huber loss handles extreme market volatility better than MSE
    model.compile({
        optimizer: tf.train.adam(0.001), // lower learning rate
        loss: tf.losses.huberLoss
    });

    console.log("Training Advanced CNN-LSTM Hybrid Model...");
    
    await model.fit(trainX, trainY, {
        epochs: 50,
        batchSize: 32,
        validationData: [valX, valY],
        callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 10 }),
        verbose: 1
    });

    return model;
}

/**
 * 4. Denormalize helper
 */
function denormalizeBdry(value) {
    return (value * (bounds.bdry.max - bounds.bdry.min)) + bounds.bdry.min;
}

/**
 * 5. Prediction Pipeline
 */
async function getFreightForecast(shockMultiplier = 1.0) {
    // If model isn't trained yet, train it once and cache it
    if (!cachedModel) {
        const historicalData = await fetchRealData();
        if (historicalData.length < LOOKBACK_DAYS + OUTLOOK_DAYS + 10) {
            throw new Error("Not enough aligned historical data fetched.");
        }
        
        const { trainX, trainY, valX, valY } = prepareData(historicalData);
        cachedModel = await trainModel(trainX, trainY, valX, valY);
        
        // Cleanup tensors to prevent memory leak
        tf.dispose([trainX, trainY, valX, valY]);
    }
    
    // Wrap inference in tf.tidy for strict memory management
    const p50_trajectory = tf.tidy(() => {
        const inputTensor = tf.tensor3d([latestMultivariateSequence], [1, LOOKBACK_DAYS, 5]);
        
        // Predict all 90 days at once
        const predictionTensor = cachedModel.predict(inputTensor);
        const normalizedPredictions = predictionTensor.dataSync();
        
        // Denormalize the entire trajectory
        const trajectory = [];
        for (let i = 0; i < OUTLOOK_DAYS; i++) {
            trajectory.push(denormalizeBdry(normalizedPredictions[i]));
        }
        return trajectory;
    });
    
    // Build the API response array according to the strict contract
    const forecastArray = [];
    const today = new Date();

    for (let i = 0; i < OUTLOOK_DAYS; i++) {
        const p50_value = p50_trajectory[i];
        
        // Calculate Stochastic Bounds (using historical volatility & time-square-root rule)
        // Variance expands as we predict further into the future (i + 1 days out)
        const timeScaledVolatility = historicalVolatility * Math.sqrt(i + 1);
        const variance = p50_value * timeScaledVolatility * shockMultiplier;
        
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + (i + 1));

        forecastArray.push({
            date: futureDate.toISOString().split('T')[0],
            p10: parseFloat(Math.max(0, p50_value - variance).toFixed(2)),
            p50: parseFloat(p50_value.toFixed(2)),
            p90: parseFloat((p50_value + variance).toFixed(2))
        });
    }
    
    return forecastArray;
}

module.exports = {
    getFreightForecast
};

