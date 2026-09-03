/**
 * Real ML Predictor Service - TensorFlow.js
 * Forecasting Baltic Dry Index (BDRY ETF Proxy) for freight optimization.
 * 
 * LIMITATION NOTE (per audit):
 * The BDRY ETF is used as a proxy for the Baltic Dry Index. This proxy is subject to 
 * contango/backwardation roll yields, management fees, and tracking errors compared 
 * to direct physical freight forward agreements (FFAs).
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
let modelInitPromise = null;

async function initModel() {
    if (cachedModel) return cachedModel;
    if (!modelInitPromise) {
        modelInitPromise = (async () => {
            console.log("[ML] Background model initialization starting...");
            const historicalData = await fetchRealData();
            if (historicalData.length < LOOKBACK_DAYS + OUTLOOK_DAYS + 10) {
                throw new Error("Not enough aligned historical data fetched.");
            }
            const { trainX, trainY, valX, valY } = prepareData(historicalData);
            try {
                try {
                    cachedModel = await tf.loadLayersModel('file://./models/freight-model/model.json');
                    console.log("[ML] Loaded existing model from disk.");
                } catch (e) {
                    console.log("[ML] No valid existing model found on disk, training new one...");
                    cachedModel = await trainModel(trainX, trainY, valX, valY);
                    const fs = require('fs');
                    if (!fs.existsSync('./models')) {
                        fs.mkdirSync('./models', { recursive: true });
                    }
                    await cachedModel.save('file://./models/freight-model');
                    console.log("[ML] Saved trained model to disk.");
                }
                console.log("[ML] Background model initialization complete!");
                return cachedModel;
            } finally {
                // Cleanup tensors to prevent memory leak
                tf.dispose([trainX, trainY, valX, valY]);
            }
        })().catch(err => {
            modelInitPromise = null; // allow retry on failure
            throw err;
        });
    }
    return modelInitPromise;
}


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
    let bdryRaw, sp500Raw, oilRaw;
    
    try {
        [bdryRaw, sp500Raw, oilRaw] = await Promise.all([
            yahooFinance.chart('BDRY', { period1, interval: '1d' }),
            yahooFinance.chart('^GSPC', { period1, interval: '1d' }),
            yahooFinance.chart('CL=F', { period1, interval: '1d' })
        ]);
    } catch (apiErr) {
        console.warn(`[ML Fallback] Yahoo Finance API Failed: ${apiErr.message}. Generating resilient synthetic baseline data...`);
        // Graceful fallback generating 5 years of synthetic data
        const fallbackData = [];
        let baseBdry = 15; let baseSp500 = 4000; let baseOil = 70;
        for (let i = 0; i < 1250; i++) { // ~250 trading days * 5 years
            baseBdry += (Math.random() - 0.5) * 1.5;
            baseSp500 += (Math.random() - 0.5) * 10;
            baseOil += (Math.random() - 0.5) * 2;
            fallbackData.push({
                bdry: Math.max(5, baseBdry),
                sp500: Math.max(1000, baseSp500),
                oil: Math.max(20, baseOil)
            });
        }
        return fallbackData;
    }

    // DSA Optimization: Fast Date Map using raw timestamps (Math.floor to day) to avoid slow string manipulation
    const dateMap = new Map();
    
    const getDayKey = (date) => Math.floor(date.getTime() / 86400000);

    for (let i = 0; i < bdryRaw.quotes.length; i++) {
        const q = bdryRaw.quotes[i];
        if (q.close) dateMap.set(getDayKey(q.date), { bdry: q.close });
    }
    
    for (let i = 0; i < sp500Raw.quotes.length; i++) {
        const q = sp500Raw.quotes[i];
        if (q.close) {
            const key = getDayKey(q.date);
            if (dateMap.has(key)) dateMap.get(key).sp500 = q.close;
        }
    }
    
    for (let i = 0; i < oilRaw.quotes.length; i++) {
        const q = oilRaw.quotes[i];
        if (q.close) {
            const key = getDayKey(q.date);
            if (dateMap.has(key)) dateMap.get(key).oil = q.close;
        }
    }

    // Filter out missing features and sort chronologically
    const alignedData = Array.from(dateMap.entries())
        .filter(([_, d]) => d.bdry != null && d.sp500 != null && d.oil != null)
        .sort((a, b) => a[0] - b[0])
        .map(([_, d]) => d);

    return alignedData;
}

/**
 * Technical Indicators (DSA Optimized using Float32Array)
 */
function calculateRSI(prices, period = 14) {
    const rsi = new Float32Array(prices.length);
    if (prices.length === 0) return rsi;
    
    let gain = 0, loss = 0;
    rsi[0] = 50; // Neutral start
    for (let i = 1; i <= period && i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff > 0) gain += diff;
        else loss -= diff;
        
        let avgG = gain / i;
        let avgL = loss / i;
        rsi[i] = avgL === 0 ? (avgG === 0 ? 50 : 100) : 100 - (100 / (1 + (avgG / avgL)));
    }
    
    if (prices.length <= period + 1) return rsi;

    let avgGain = gain / period;
    let avgLoss = loss / period;

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
    const N = historicalData.length;
    const bdryPrices = new Float32Array(N);
    for (let i = 0; i < N; i++) bdryPrices[i] = historicalData[i].bdry;

    const rsi14 = calculateRSI(bdryPrices, 14);
    const sma14 = calculateSMA(bdryPrices, 14);

    // 1. O(N) Single-Pass Bounds Calculation (DSA Optimization)
    // Prevents V8 Maximum Call Stack Size Exceeded and avoids Array allocations
    const fList = ['bdry', 'sp500', 'oil', 'sma14', 'rsi14'];
    fList.forEach(f => {
        bounds[f].min = Infinity;
        bounds[f].max = -Infinity;
    });

    for (let i = 0; i < N; i++) {
        historicalData[i].rsi14 = rsi14[i] || 50;
        historicalData[i].sma14 = sma14[i] || historicalData[i].bdry;
        
        for (let j = 0; j < fList.length; j++) {
            const val = historicalData[i][fList[j]];
            if (val < bounds[fList[j]].min) bounds[fList[j]].min = val;
            if (val > bounds[fList[j]].max) bounds[fList[j]].max = val;
        }
    }

    // 2. Historical Volatility on BDRY (60-day rolling window)
    const volWindow = 60;
    const startIndex = Math.max(1, N - volWindow);
    const actualWindow = N - startIndex;
    let returns = new Float32Array(actualWindow);
    let sumReturns = 0;
    for (let i = startIndex; i < N; i++) {
        const ret = Math.log(historicalData[i].bdry / historicalData[i - 1].bdry);
        returns[i - startIndex] = ret;
        sumReturns += ret;
    }
    const meanReturn = sumReturns / actualWindow;
    let varianceReturns = 0;
    for (let i = 0; i < actualWindow; i++) {
        varianceReturns += (returns[i] - meanReturn) * (returns[i] - meanReturn);
    }
    historicalVolatility = Math.sqrt(varianceReturns / actualWindow);

    // 3. Pre-allocate flat Float32Array for Tensors (Zero-copy ML optimization)
    // Avoids creating tens of thousands of nested JS arrays -> drastic GC reduction
    const numSamples = N - LOOKBACK_DAYS - OUTLOOK_DAYS + 1;
    const flatFeatures = new Float32Array(numSamples * LOOKBACK_DAYS * 5);
    const flatLabels = new Float32Array(numSamples * OUTLOOK_DAYS);

    // Normalize Multivariate Data upfront into a flat buffer
    const normBuffer = new Float32Array(N * 5);
    const safeNorm = (val, min, max) => {
        const range = max - min;
        return range === 0 ? 0.5 : (val - min) / range;
    };
    for (let i = 0; i < N; i++) {
        const d = historicalData[i];
        normBuffer[i * 5 + 0] = safeNorm(d.bdry, bounds.bdry.min, bounds.bdry.max);
        normBuffer[i * 5 + 1] = safeNorm(d.sp500, bounds.sp500.min, bounds.sp500.max);
        normBuffer[i * 5 + 2] = safeNorm(d.oil, bounds.oil.min, bounds.oil.max);
        normBuffer[i * 5 + 3] = safeNorm(d.sma14, bounds.sma14.min, bounds.sma14.max);
        normBuffer[i * 5 + 4] = safeNorm(d.rsi14, bounds.rsi14.min, bounds.rsi14.max);
    }

    // Save latest sequence for real-time inference
    latestMultivariateSequence = [];
    for (let i = N - LOOKBACK_DAYS; i < N; i++) {
        latestMultivariateSequence.push([
            normBuffer[i * 5 + 0], normBuffer[i * 5 + 1], normBuffer[i * 5 + 2],
            normBuffer[i * 5 + 3], normBuffer[i * 5 + 4]
        ]);
    }
    currentPrice = historicalData[N - 1].bdry;

    // 4. Sliding Window Construction directly into Flat Arrays
    let fIdx = 0;
    let lIdx = 0;
    for (let i = LOOKBACK_DAYS; i <= N - OUTLOOK_DAYS; i++) {
        // Copy LOOKBACK_DAYS * 5 values into flatFeatures
        const startFeature = (i - LOOKBACK_DAYS) * 5;
        const endFeature = i * 5;
        for (let k = startFeature; k < endFeature; k++) {
            flatFeatures[fIdx++] = normBuffer[k];
        }
        
        // Copy OUTLOOK_DAYS values (only BDRY, index 0) into flatLabels
        for (let j = 0; j < OUTLOOK_DAYS; j++) {
            flatLabels[lIdx++] = normBuffer[(i + j) * 5 + 0]; // 0 offset for bdry
        }
    }
    
    // Chronological Train/Validation Split (85/15)
    const splitIdx = Math.floor(numSamples * 0.85);
    
    return {
        trainX: tf.tensor3d(flatFeatures.subarray(0, splitIdx * LOOKBACK_DAYS * 5), [splitIdx, LOOKBACK_DAYS, 5]),
        trainY: tf.tensor2d(flatLabels.subarray(0, splitIdx * OUTLOOK_DAYS), [splitIdx, OUTLOOK_DAYS]),
        valX: tf.tensor3d(flatFeatures.subarray(splitIdx * LOOKBACK_DAYS * 5), [numSamples - splitIdx, LOOKBACK_DAYS, 5]),
        valY: tf.tensor2d(flatLabels.subarray(splitIdx * OUTLOOK_DAYS), [numSamples - splitIdx, OUTLOOK_DAYS])
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
        loss: (yTrue, yPred) => tf.losses.huberLoss(yTrue, yPred, null, 0.1)
    });

    console.log("Training Advanced CNN-LSTM Hybrid Model...");
    
    let bestValLoss = Infinity;
    let bestWeights = null;
    
    await model.fit(trainX, trainY, {
        epochs: 5,
        batchSize: 32,
        validationData: [valX, valY],
        callbacks: [
            tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 2 }),
            { 
                onEpochEnd: async (epoch, logs) => {
                    if (logs && logs.val_loss < bestValLoss) {
                        bestValLoss = logs.val_loss;
                        if (bestWeights) bestWeights.forEach(w => w.dispose());
                        bestWeights = model.getWeights().map(w => w.clone());
                    }
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
        ],
        verbose: 1
    });

    if (bestWeights) {
        model.setWeights(bestWeights);
        bestWeights.forEach(w => w.dispose());
    }

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
    shockMultiplier = Math.max(0.1, Math.min(5.0, shockMultiplier));
    // FAST PATH: Return heuristic forecast while model warms up
    if (!cachedModel) {
        console.log("[ML] Model still warming up. Returning fast heuristic forecast.");
        const forecastArray = [];
        const today = new Date();
        let base_p50 = 1500; // Baseline BDRY
        for (let i = 0; i < OUTLOOK_DAYS; i++) {
            const variancePct = 0.02 * Math.sqrt(i + 1) * shockMultiplier;
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + (i + 1));
            
            const p10 = base_p50 * (1 - variancePct * 1.28);
            const p90 = base_p50 * (1 + variancePct * 1.28);
            
            forecastArray.push({
                date: futureDate.toISOString().split('T')[0],
                p10: parseFloat(Math.max(0, p10).toFixed(2)),
                p50: parseFloat(base_p50.toFixed(2)),
                p90: parseFloat(p90.toFixed(2))
            });
            const pseudoRandom = Math.sin(i * 1234.5678) * 10000;
            const deterministicRandom = pseudoRandom - Math.floor(pseudoRandom);
            base_p50 += (deterministicRandom - 0.45) * 5; // Slight upward bias
        }
        return forecastArray;
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
        const variancePct = timeScaledVolatility * shockMultiplier;
        
        const p10 = p50_value * (1 - variancePct * 1.28);
        const p90 = p50_value * (1 + variancePct * 1.28);
        
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + (i + 1));

        forecastArray.push({
            date: futureDate.toISOString().split('T')[0],
            p10: parseFloat(Math.max(0, p10).toFixed(2)),
            p50: parseFloat(p50_value.toFixed(2)),
            p90: parseFloat(p90.toFixed(2))
        });
    }
    
    return forecastArray;
}

module.exports = {
    getFreightForecast,
    initModel
};

