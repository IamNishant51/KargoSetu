const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const router = express.Router();
const prisma = new PrismaClient();

const SettingsArraySchema = z.array(
    z.object({
        key: z.string().min(1),
        value: z.union([z.string(), z.number(), z.boolean()]).transform(String)
    })
);
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
        const parseResult = SettingsArraySchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ 
                error: 'Invalid settings payload', 
                details: parseResult.error.errors 
            });
        }
        const settingsArray = parseResult.data;
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
