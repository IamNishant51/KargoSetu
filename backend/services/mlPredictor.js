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
const LOOKBACK_DAYS = 30; // Increased lookback for better temporal context

// Feature normalization bounds
let bounds = {
    bdry: { min: 0, max: 1 },
    sp500: { min: 0, max: 1 },
    oil: { min: 0, max: 1 }
};


/**
 * 1. Data Ingestion & Alignment: Fetch real multivariate data (BDRY, S&P500, Crude Oil)
 */
async function fetchRealData() {
    console.log("Fetching real multivariate historical data (BDRY, ^GSPC, CL=F)...");
    const period1 = new Date();
    period1.setFullYear(period1.getFullYear() - 3); // 3 years for more robust training
    
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
 * 2. Feature Engineering: Min-Max Scaling & Direct Multi-step Sequence Generation
 */
function prepareData(historicalData) {
    // Calculate Bounds for Min-Max Scaling
    bounds.bdry.min = Math.min(...historicalData.map(d => d.bdry));
    bounds.bdry.max = Math.max(...historicalData.map(d => d.bdry));
    bounds.sp500.min = Math.min(...historicalData.map(d => d.sp500));
    bounds.sp500.max = Math.max(...historicalData.map(d => d.sp500));
    bounds.oil.min = Math.min(...historicalData.map(d => d.oil));
    bounds.oil.max = Math.max(...historicalData.map(d => d.oil));

    // Calculate historical volatility on BDRY (std dev of daily log returns)
    let returns = [];
    for (let i = 1; i < historicalData.length; i++) {
        returns.push(Math.log(historicalData[i].bdry / historicalData[i - 1].bdry));
    }
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const varianceReturns = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    historicalVolatility = Math.sqrt(varianceReturns);

    // Normalize Multivariate Data
    const normalizedData = historicalData.map(d => [
        (d.bdry - bounds.bdry.min) / (bounds.bdry.max - bounds.bdry.min),
        (d.sp500 - bounds.sp500.min) / (bounds.sp500.max - bounds.sp500.min),
        (d.oil - bounds.oil.min) / (bounds.oil.max - bounds.oil.min)
    ]);

    latestMultivariateSequence = normalizedData.slice(-LOOKBACK_DAYS);
    currentPrice = historicalData[historicalData.length - 1].bdry;

    const features = [];
    const labels = [];
    
    // Create sliding windows for DIRECT Multi-step forecasting
    // Input: 30 days of 3 features (BDRY, SP500, OIL)
    // Output: Next 90 days of BDRY
    for (let i = LOOKBACK_DAYS; i <= normalizedData.length - OUTLOOK_DAYS; i++) {
        features.push(normalizedData.slice(i - LOOKBACK_DAYS, i));
        // The label is the next OUTLOOK_DAYS of purely the BDRY index (feature index 0)
        labels.push(normalizedData.slice(i, i + OUTLOOK_DAYS).map(d => d[0]));
    }
    
    // Chronological Train/Validation Split (85/15) - crucial for time series
    const splitIdx = Math.floor(features.length * 0.85);

    return {
        // X Shape: [batch_size, time_steps, features] -> [N, 30, 3]
        trainX: tf.tensor3d(features.slice(0, splitIdx), [splitIdx, LOOKBACK_DAYS, 3]),
        trainY: tf.tensor2d(labels.slice(0, splitIdx), [splitIdx, OUTLOOK_DAYS]),
        valX: tf.tensor3d(features.slice(splitIdx), [features.length - splitIdx, LOOKBACK_DAYS, 3]),
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
        inputShape: [LOOKBACK_DAYS, 3]
    }));
    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
    
    // LSTM for long-term temporal dependencies
    model.add(tf.layers.lstm({
        units: 64,
        returnSequences: false
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
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
        epochs: 40,
        batchSize: 32,
        validationData: [valX, valY],
        callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 7 }),
        verbose: 0 
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
    
    let p50_value = 0;

    // Wrap inference in tf.tidy for strict memory management
    tf.tidy(() => {
        const inputTensor = tf.tensor3d([latestMultivariateSequence], [1, LOOKBACK_DAYS, 3]);
        
        // Predict all 90 days at once
        const predictionTensor = cachedModel.predict(inputTensor);
        const normalizedPredictions = predictionTensor.dataSync();
        
        // For the headline metric, we'll take the predicted value at the END of the 90-day outlook
        // Alternatively, an average of the period. Let's take the end period.
        const finalDayNormalized = normalizedPredictions[OUTLOOK_DAYS - 1];
        p50_value = denormalizeBdry(finalDayNormalized);
    });
    
    // Calculate Stochastic Bounds (using historical volatility & time-square-root rule)
    const timeScaledVolatility = historicalVolatility * Math.sqrt(OUTLOOK_DAYS);
    
    // Apply the shock multiplier from the "What-If" slider
    const variance = p50_value * timeScaledVolatility * shockMultiplier;
    
    return {
        timestamp: new Date().toISOString(),
        outlook_days: OUTLOOK_DAYS,
        underlying_index: "BDRY (Baltic Dry Index Proxy)",
        current_rate: parseFloat(currentPrice.toFixed(2)),
        shock_multiplier_applied: parseFloat(shockMultiplier.toFixed(2)),
        historical_daily_volatility: parseFloat((historicalVolatility * 100).toFixed(2)) + "%",
        forecast: {
            p10_optimistic: parseFloat(Math.max(0, p50_value - variance).toFixed(2)), // ensure non-negative
            p50_median: parseFloat(p50_value.toFixed(2)),
            p90_pessimistic: parseFloat((p50_value + variance).toFixed(2))
        },
        model_status: "CNN-LSTM Hybrid (Direct Multi-Step, Huber Loss, S&P500/Oil Exogenous)"
    };
}

module.exports = {
    getFreightForecast
};

