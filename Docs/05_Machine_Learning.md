# MODULE 5: MACHINE LEARNING & PREDICTIVE FREIGHT MODELING

## 5.1 Pipeline & Feature Engineering
*   **Data Sources:** External REST APIs for BDI (Baltic Dry Index) proxies, World Bank Commodity APIs, Maritime bunker rates.
*   **Features:** Lag-7/14/30 returns, 14d rolling volatility, EMA(20, 50, 200).
*   **Algorithm:** TensorFlow.js (`@tensorflow/tfjs-node`) using an LSTM (Long Short-Term Memory) Neural Network or Dense layers for quantile-like boundary prediction.

## 5.2 Node.js (TensorFlow.js) ML Blueprint
```javascript
import * as tf from '@tensorflow/tfjs-node';

// Feature Engineering Mock (In production, replace with Danfo.js or raw array manipulation)
function engineerFeatures(historicalData) {
    // Generate Lags, Volatility, and EMAs
    // Returning normalized tensors for training
    const features = [];
    const labels = [];
    
    for (let i = 14; i < historicalData.length; i++) {
        // Simplified feature extraction (Lag and Current Value)
        features.push([
            historicalData[i-1], // Lag 1
            historicalData[i-7], // Lag 7
            historicalData[i-14] // Lag 14
        ]);
        labels.push(historicalData[i]); // Target
    }
    
    return {
        X: tf.tensor2d(features),
        y: tf.tensor2d(labels, [labels.length, 1])
    };
}

async function trainModel(X, y) {
    const model = tf.sequential();
    
    // LSTM layer for time-series memory
    model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [3] }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    
    // Output layer (Single prediction value - P50 equivalent)
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
    });

    console.log("Training Freight Predictor Model...");
    await model.fit(X, y, {
        epochs: 50,
        batchSize: 32,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (epoch % 10 === 0) console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
            }
        }
    });

    return model;
}

async function generateForecast(model, latestFeatures) {
    // Predict next timestep
    const inputTensor = tf.tensor2d([latestFeatures]);
    const prediction = model.predict(inputTensor);
    const p50_value = await prediction.data();
    
    // Naive confidence bounds calculation for blueprint
    const variance = p50_value[0] * 0.15; // 15% arbitrary variance band
    
    return {
        P10: (p50_value[0] - variance).toFixed(2),
        P50: p50_value[0].toFixed(2),
        P90: (p50_value[0] + variance).toFixed(2)
    };
}

async function runPipeline() {
    // Simulated historical BDI/BDRY index data
    const mockHistoricalData = Array.from({length: 200}, () => Math.random() * 50 + 1500);
    
    const { X, y } = engineerFeatures(mockHistoricalData);
    const model = await trainModel(X, y);
    
    // Predict using latest known lags [t-1, t-7, t-14]
    const latestKnown = [1540.2, 1510.5, 1490.8];
    const forecast = await generateForecast(model, latestKnown);
    
    console.log("90-Day Outlook Projection Bounds:", forecast);
}

runPipeline();
```
