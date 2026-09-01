const express = require('express');
const cors = require('cors');
const { z } = require('zod');
let prisma = null;
try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
} catch (e) {
    console.warn("Prisma client not available. Will use fallback database.", e.message);
}
const { evaluateRequisition } = require('./services/maritimeMath');
const { getFreightForecast } = require('./services/mlPredictor');

const app = express();
app.use(cors());
app.use(express.json());

// Request Validator
const RequisitionSchema = z.object({
    volume_mt: z.number().positive(),
    dest_port_name: z.string().min(2),
    commodity: z.string().min(3)
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', service: 'KargoSetu API', timestamp: new Date() });
});

// 1. Port Constraint Evaluation & Cargo Splitting Endpoint
app.post('/api/v1/requisitions/evaluate', async (req, res) => {
    const parseResult = RequisitionSchema.safeParse(req.body);
    
    if (!parseResult.success) {
        return res.status(400).json({ 
            error: "Invalid request payload", 
            details: parseResult.error.errors 
        });
    }

    const { volume_mt, dest_port_name, commodity } = parseResult.data;
    
    try {
        // Fetch actual port bathymetry from PostgreSQL via Prisma
        let portData = null;
        try {
            if (prisma) {
                portData = await prisma.port.findUnique({
                    where: { name: dest_port_name }
                });
            } else {
                throw new Error("Prisma client disabled.");
            }
        } catch(dbErr) {
            console.warn("Database connection failed or not configured. Using fallback port data.");
            // Fallback for Hackathon if Postgres isn't running
            const MOCK_PORTS = {
                "Haldia": { permissibleDraft: 7.5, lat: 22.02, lon: 88.06 },
                "Paradip": { permissibleDraft: 14.5, lat: 20.26, lon: 86.67 },
                "Dhamra": { permissibleDraft: 16.0, lat: 20.83, lon: 86.96 }
            };
            portData = MOCK_PORTS[dest_port_name];
        }
        
        if (!portData) {
            return res.status(404).json({ error: `Port ${dest_port_name} not found in database or fallback.` });
        }
        const evaluation = await evaluateRequisition(volume_mt, portData.permissibleDraft, commodity, portData.lat, portData.lon);
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
