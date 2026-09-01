const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const { evaluateRequisition } = require('./services/maritimeMath');
const { getFreightForecast } = require('./services/mlPredictor');

const app = express();
app.use(cors());
app.use(express.json());

// Request Validator
const RequisitionSchema = z.object({
    volume_mt: z.number().positive(),
    dest_port_draft: z.number().positive(),
    commodity: z.string().min(3)
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', service: 'KargoSetu API', timestamp: new Date() });
});

// 1. Port Constraint Evaluation & Cargo Splitting Endpoint
app.post('/api/v1/requisitions/evaluate', (req, res) => {
    const parseResult = RequisitionSchema.safeParse(req.body);
    
    if (!parseResult.success) {
        return res.status(400).json({ 
            error: "Invalid request payload", 
            details: parseResult.error.errors 
        });
    }

    const { volume_mt, dest_port_draft, commodity } = parseResult.data;
    
    try {
        const evaluation = evaluateRequisition(volume_mt, dest_port_draft, commodity);
        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error during evaluation", message: error.message });
    }
});

// 2. Machine Learning Predictive Freight Rate Endpoint
app.get('/api/v1/forecast/rates', async (req, res) => {
    try {
        const shockMultiplier = parseFloat(req.query.shockMultiplier) || 1.0;
        const forecast = await getFreightForecast(shockMultiplier);
        res.json(forecast);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate ML forecast", message: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`🚢 KargoSetu Backend (Node.js/Express)`);
    console.log(`==========================================`);
    console.log(`Server running on port ${PORT}`);
    console.log(`- Health Check: GET /api/health`);
    console.log(`- Constraint Solver: POST /api/v1/requisitions/evaluate`);
    console.log(`- ML Forecast: GET /api/v1/forecast/rates`);
});
