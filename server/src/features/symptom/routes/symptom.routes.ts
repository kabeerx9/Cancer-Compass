import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { requireAuthWithSync } from '../../../middleware/auth.middleware';
import { SymptomController } from '../controllers/symptom.controller';
import { SymptomRepository } from '../repositories/symptom.repository';
import { SymptomService } from '../services/symptom.service';

// Dependency Injection
const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const symptomRepository = new SymptomRepository(prisma);
const symptomService = new SymptomService(symptomRepository);
const symptomController = new SymptomController(symptomService);

const router = Router();

// All routes require authentication
router.use(requireAuthWithSync);

// GET /symptoms - Get all symptom logs
router.get('/', symptomController.getAll);

// GET /symptoms/today - Check if today's log exists
router.get('/today', symptomController.checkToday);

// GET /symptoms/range - Get logs for date range
router.get('/range', symptomController.getByDateRange);

// GET /symptoms/summary - Generate AI summary
router.get('/summary', symptomController.getSummary);

// POST /symptoms - Create or update symptom log
router.post('/', symptomController.createOrUpdate);

// PUT /symptoms/:id - Update symptom log
router.put('/:id', symptomController.update);

// DELETE /symptoms/:id - Delete symptom log
router.delete('/:id', symptomController.delete);

export default router;
