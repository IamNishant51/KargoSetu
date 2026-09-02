const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { evaluateRequisition } = require('../services/maritimeMath');

const router = express.Router();
const prisma = new PrismaClient();

const RequisitionSchema = z.object({
    volume_mt: z.number().positive(),
    dest_port_name: z.string().min(2),
    commodity: z.string().min(3)
});

router.post('/evaluate', async (req, res, next) => {
    try {
        const parseResult = RequisitionSchema.safeParse(req.body);
        
        if (!parseResult.success) {
            return res.status(400).json({ 
                error: "Invalid request payload", 
                details: parseResult.error.errors 
            });
        }

        const { volume_mt, dest_port_name, commodity } = parseResult.data;
        
        const portData = await prisma.port.findUnique({
            where: { name: dest_port_name }
        });

        if (!portData) {
            return res.status(404).json({ error: `Port ${dest_port_name} not found in PostgreSQL database.` });
        }

        const evaluation = await evaluateRequisition(volume_mt, portData.permissibleDraft, commodity, portData.lat, portData.lon);
        res.json(evaluation);
    } catch (error) {
        next(error);
    }
});

module.exports = router;