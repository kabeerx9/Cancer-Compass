import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { requireAuthWithSync } from '../../../middleware/auth.middleware';
import { MedicationController } from '../controllers/medication.controller';
import { MedicationRepository } from '../repositories/medication.repository';
import { MedicationService } from '../services/medication.service';

// Dependency Injection
const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const medicationRepository = new MedicationRepository(prisma);
const medicationService = new MedicationService(medicationRepository);
const medicationController = new MedicationController(medicationService);

const router = Router();

// All routes require authentication
router.use(requireAuthWithSync);

// GET /medications - Get all medications
router.get('/', medicationController.getAll);

// GET /medications/today - Get today's medications with status
router.get('/today', medicationController.getToday);

// GET /medications/:id - Get a specific medication
router.get('/:id', medicationController.getById);

// POST /medications - Create a new medication
router.post('/', medicationController.create);

// PUT /medications/:id - Update a medication
router.put('/:id', medicationController.update);

// DELETE /medications/:id - Delete a medication
router.delete('/:id', medicationController.delete);

// POST /medications/:id/log - Log medication as taken/skipped
router.post('/:id/log', medicationController.log);

export default router;
