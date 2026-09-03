const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', async (req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'active', service: 'KargoSetu API', timestamp: new Date() });
    } catch (error) {
        next(error);
    }
});

module.exports = router;