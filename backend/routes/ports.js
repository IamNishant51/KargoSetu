const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const ports = await prisma.port.findMany();
        res.json(ports);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
