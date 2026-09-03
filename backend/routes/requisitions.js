const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { evaluateRequisition } = require('../services/maritimeMath');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1'
});

const router = express.Router();

const RequisitionSchema = z.object({
    volume_mt: z.number().positive(),
    dest_port_name: z.string().min(2),
    commodity: z.string().min(3),
    preferredVessel: z.string().optional(),
    laycanStart: z.string().optional(),
    laycanEnd: z.string().optional(),
    arrivalDate: z.string().optional()
});
const RequisitionCreateSchema = z.object({
    volume_mt: z.number().positive(),
    dest_port: z.string().min(2),
    commodity: z.string().min(3),
    origin: z.string().optional(),
    status: z.string().optional()
});

const RequisitionQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    status: z.string().optional(),
    commodity: z.string().optional(),
    origin: z.string().optional(),
    search: z.string().optional(),
    dateRange: z.string().optional()
});

const IdSchema = z.object({
    id: z.string().uuid()
});

router.get('/', async (req, res, next) => {
    try {
        const parseResult = RequisitionQuerySchema.safeParse(req.query);
        if (!parseResult.success) {
            return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid query parameters", details: parseResult.error.errors } });
        }
        
        const { page: pageNum, limit: limitNum, status, commodity, origin, search, dateRange } = parseResult.data;
        const where = {};
        if (status && status !== 'All Statuses') where.status = status;
        if (commodity && commodity !== 'All Commodities') where.commodity = commodity;
        if (origin && origin !== 'All Origins') where.origin = origin;

        if (search) {
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                { commodity: { contains: search, mode: 'insensitive' } },
                { dest_port: { contains: search, mode: 'insensitive' } },
                { origin: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        if (dateRange && dateRange !== 'All Time') {
            const now = new Date();
            if (dateRange === 'Last 7 Days') {
                now.setDate(now.getDate() - 7);
                where.createdAt = { gte: now };
            } else if (dateRange === 'Last 30 Days') {
                now.setDate(now.getDate() - 30);
                where.createdAt = { gte: now };
            }
        }

        const [requisitions, total] = await Promise.all([
            prisma.requisition.findMany({
                where,
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.requisition.count({ where })
        ]);

        res.json({
            data: requisitions,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const parseResult = RequisitionCreateSchema.safeParse(req.body);
        
        if (!parseResult.success) {
            return res.status(400).json({ 
                success: false,
                error: {
                    code: "BAD_REQUEST",
                    message: "Invalid request payload", 
                    details: parseResult.error.errors 
                }
            });
        }

        const requisition = await prisma.requisition.create({
            data: parseResult.data
        });

        res.status(201).json(requisition);
    } catch (error) {
        next(error);
    }
});

const EvaluationResponseSchema = z.object({
    feasible: z.boolean(),
    strategy: z.string(),
    optimalVessel: z.string().nullable().optional(),
    requiredVessels: z.number().nullable().optional(),
    totalCost: z.number().nullable().optional(),
    totalDays: z.number().nullable().optional(),
    breakdown: z.array(z.any()).optional(),
    ai_insight: z.string().optional()
});

router.post('/evaluate', async (req, res, next) => {
    try {
        const parseResult = RequisitionSchema.safeParse(req.body);
        
        if (!parseResult.success) {
            return res.status(400).json({ 
                success: false,
                error: {
                    code: "BAD_REQUEST",
                    message: "Invalid request payload", 
                    details: parseResult.error.errors 
                }
            });
        }

        const { volume_mt, dest_port_name, commodity, preferredVessel, laycanStart, laycanEnd, arrivalDate } = parseResult.data;
        
        const portData = await prisma.port.findUnique({
            where: { name: dest_port_name }
        });

        if (!portData) {
            return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: `Port ${dest_port_name} not found in PostgreSQL database.` } });
        }

        const evaluation = await evaluateRequisition(
            volume_mt, 
            portData.permissibleDraft, 
            commodity, 
            portData.lat, 
            portData.lon,
            portData.brackishDensity,
            portData.chartedDepth,
            portData.typicalTidalRange,
            portData.maxVesselClass,
            { preferredVessel, laycanStart, laycanEnd, arrivalDate }
        );
        const prompt = `You are a Maritime Analyst. Write a 2-3 sentence strategic insight based on these evaluation results: Feasible: ${evaluation.feasible}, Strategy: ${evaluation.strategy}`;
        
        let ai_insight = "AI insight unavailable.";
        try {
            const chatCompletion = await openai.chat.completions.create({
                model: "meta/llama-3.1-70b-instruct",
                messages: [{ role: "user", content: prompt }],
            });
            ai_insight = chatCompletion.choices[0].message.content.trim();
        } catch (err) {
            console.error("OpenAI Error:", err);
        }

        const responseData = { ...evaluation, ai_insight };
        const validResponse = EvaluationResponseSchema.parse(responseData);
        res.json(validResponse);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const parseResult = IdSchema.safeParse(req.params);
        if (!parseResult.success) {
            return res.status(400).json({ 
                success: false,
                error: {
                    code: "BAD_REQUEST",
                    message: "Invalid ID format", 
                    details: parseResult.error.errors 
                }
            });
        }
        const { id } = parseResult.data;
        await prisma.requisition.delete({
            where: { id }
        });
        res.json({ success: true, message: "Requisition deleted" });
    } catch (error) {
            return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: `Requisition ${req.params.id} not found` } });
    }
});

module.exports = router;