const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET all settings
router.get('/', async (req, res, next) => {
    try {
        const settings = await prisma.userSetting.findMany();
        res.json(settings);
    } catch (error) {
        next(error);
    }
});

// POST upsert settings array
router.post('/', async (req, res, next) => {
    try {
        const settingsArray = req.body;
        if (!Array.isArray(settingsArray)) {
            return res.status(400).json({ error: 'Body must be an array of settings objects' });
        }

        const upsertedSettings = await prisma.$transaction(
            settingsArray.map((setting) =>
                prisma.userSetting.upsert({
                    where: { key: setting.key },
                    update: { value: String(setting.value) },
                    create: { key: setting.key, value: String(setting.value) }
                })
            )
        );

        res.json(upsertedSettings);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
