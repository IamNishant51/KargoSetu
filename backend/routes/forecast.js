const express = require('express');
const rateLimit = require('express-rate-limit');
const { getFreightForecast } = require('../services/mlPredictor');
const { z } = require('zod');

const router = express.Router();

// Strict rate limiter for ML inference to prevent CPU exhaustion
const mlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: { error: "Too many requests to ML prediction engine, please try again after 15 minutes." }
});

const ratesQuerySchema = z.object({
    shockMultiplier: z.coerce.number().min(0).default(1.0)
});

router.get('/rates', mlLimiter, async (req, res, next) => {
    try {
        const parseResult = ratesQuerySchema.safeParse(req.query);
        if (!parseResult.success) {
            return res.status(400).json({ error: "Invalid query parameters", details: parseResult.error.errors });
        }
        
        const shockMultiplier = parseResult.data.shockMultiplier;
        const forecast = await getFreightForecast(shockMultiplier);
        res.json(forecast);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
