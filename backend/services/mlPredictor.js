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
let latestSequence = [];
let currentPrice = 0;
let historicalVolatility = 0;


const LOOKBACK_DAYS = 14;

/**
 * 1. Data Ingestion: Fetch real historical data from Yahoo Finance
 */
async function fetchRealData() {
    console.log("Fetching real BDRY historical data...");
    const period1 = new Date();
    period1.setFullYear(period1.getFullYear() - 2); // Get last 2 years of data
    
    const result = await yahooFinance.chart('BDRY', { 
        period1: period1, 
        interval: '1d' 
    });
    
    // Extract closing prices
    return result.quotes.map(day => day.close).filter(val => val !== null && !isNaN(val));
}

/**
 * 2. Feature Engineering: Min-Max Scaling and Sequence Generation
 */
function prepareData(historicalPrices) {
    // Calculate Min and Max for normalization
    dataMin = Math.min(...historicalPrices);
    dataMax = Math.max(...historicalPrices);
    
    // Calculate historical volatility (std dev of daily log returns)
    let returns = [];
    for (let i = 1; i < historicalPrices.length; i++) {
        returns.push(Math.log(historicalPrices[i] / historicalPrices[i - 1]));
    }
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const varianceReturns = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    historicalVolatility = Math.sqrt(varianceReturns);

    // Normalize data between 0 and 1
    const normalizedData = historicalPrices.map(price => (price - dataMin) / (dataMax - dataMin));
    
    // Save the very last sequence for future prediction
    latestSequence = normalizedData.slice(-LOOKBACK_DAYS);
    currentPrice = historicalPrices[historicalPrices.length - 1];

    const features = [];
    const labels = [];
    
    // Create sliding windows
    for (let i = LOOKBACK_DAYS; i < normalizedData.length; i++) {
        features.push(normalizedData.slice(i - LOOKBACK_DAYS, i));
        labels.push(normalizedData[i]);
    }
    
    return {
        // Shape: [batch_size, time_steps, features] -> [N, 14, 1]
        X: tf.tensor3d(features.flat(), [features.length, LOOKBACK_DAYS, 1]),
        y: tf.tensor2d(labels, [labels.length, 1])
    };
}

/**
 * 3. Model Architecture & Training
 */
async function trainModel(X, y) {
    const model = tf.sequential();
    
    // Real LSTM Layer for time-series forecasting
    model.add(tf.layers.lstm({
        units: 32,
        inputShape: [LOOKBACK_DAYS, 1],
        returnSequences: false
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 })); // Output next day normalized price

    model.compile({
        optimizer: tf.train.adam(0.005),
        loss: 'meanSquaredError'
    });

    console.log("Training Freight Predictor LSTM Model (this takes a few seconds)...");
    
    await model.fit(X, y, {
        epochs: 25,
        batchSize: 32,
        verbose: 0 
    });

    return model;
}

/**
 * 4. Denormalize helper
 */
function denormalize(value) {
    return (value * (dataMax - dataMin)) + dataMin;
}

/**
 * 5. Prediction Pipeline
 */
async function getFreightForecast(shockMultiplier = 1.0) {
    // If model isn't trained yet, train it once and cache it
    if (!cachedModel) {
        const prices = await fetchRealData();
        if (prices.length < LOOKBACK_DAYS + 10) {
            throw new Error("Not enough historical data fetched.");
        }
        
        const { X, y } = prepareData(prices);
        cachedModel = await trainModel(X, y);
        
        // Cleanup tensors to prevent memory leak
        X.dispose();
        y.dispose();
    }
    
    const OUTLOOK_DAYS = 90;
    let currentSequence = [...latestSequence];
    let normalizedPrediction = 0;

    // Auto-regressive loop to predict t+1 through t+90
    // Auto-regressive loop to predict t+1 through t+90
    for (let i = 0; i < OUTLOOK_DAYS; i++) {
        const inputTensor = tf.tensor3d(currentSequence, [1, LOOKBACK_DAYS, 1]);
        const prediction = cachedModel.predict(inputTensor);
        normalizedPrediction = prediction.dataSync()[0]; 
        
        inputTensor.dispose();
        prediction.dispose();
        
        // Shift sequence: remove oldest, append new prediction
        currentSequence.shift();
        currentSequence.push(normalizedPrediction);
    }
    
    // Denormalize back to real dollar values
    const p50_value = denormalize(normalizedPrediction);
    
    // Calculate Stochastic Bounds (using historical volatility & time-square-root rule)
    // We scale the daily volatility by sqrt(T) for a T-day horizon.
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
        model_status: "LSTM Online & Cached (Auto-Regressive)"
    };
}

module.exports = {
    getFreightForecast
};
