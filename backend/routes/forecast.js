const express = require('express');
const rateLimit = require('express-rate-limit');
const { getFreightForecast } = require('../services/mlPredictor');

const router = express.Router();

// Strict rate limiter for ML inference to prevent CPU exhaustion
const mlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: { error: "Too many requests to ML prediction engine, please try again after 15 minutes." }
});

router.get('/rates', mlLimiter, async (req, res, next) => {
    try {
        const shockMultiplier = parseFloat(req.query.shockMultiplier) || 1.0;
        const forecast = await getFreightForecast(shockMultiplier);
        res.json(forecast);
    } catch (error) {
        next(error);
    }
});

module.exports = router;