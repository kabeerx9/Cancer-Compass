import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { requireAuthWithSync } from '../../../middleware/auth.middleware';
import { SosMedicineController } from '../controllers/sos-medicine.controller';
import { SosMedicineRepository } from '../repositories/sos-medicine.repository';
import { SosMedicineService } from '../services/sos-medicine.service';

// Dependency Injection
const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const sosMedicineRepository = new SosMedicineRepository(prisma);
const sosMedicineService = new SosMedicineService(sosMedicineRepository);
const sosMedicineController = new SosMedicineController(sosMedicineService);

const router = Router();

// All routes require authentication
router.use(requireAuthWithSync);

// GET /sos-medicines - Get all SOS medicines
router.get('/', sosMedicineController.getAll);

// GET /sos-medicines/active - Get active SOS medicines
router.get('/active', sosMedicineController.getActive);

// GET /sos-medicines/stats - Get stats
router.get('/stats', sosMedicineController.getStats);

// GET /sos-medicines/logs/all - Get all logs
router.get('/logs/all', sosMedicineController.getAllLogs);

// GET /sos-medicines/:id - Get a specific SOS medicine
router.get('/:id', sosMedicineController.getById);

// POST /sos-medicines - Create a new SOS medicine
router.post('/', sosMedicineController.create);

// PUT /sos-medicines/:id - Update a SOS medicine
router.put('/:id', sosMedicineController.update);

// DELETE /sos-medicines/:id - Delete a SOS medicine
router.delete('/:id', sosMedicineController.delete);

// POST /sos-medicines/:id/log - Log SOS medicine as taken
router.post('/:id/log', sosMedicineController.log);

// GET /sos-medicines/:id/logs - Get logs for a specific SOS medicine
router.get('/:id/logs', sosMedicineController.getLogs);

export default router;
