import { Router } from 'express';
import { PrismaService } from '../../../config/prisma.config';
import { requireAuthWithSync } from '../../../middleware/auth.middleware';
import { TemplateRepository } from '../repositories/template.repository';
import { TemplateService } from '../services/template.service';
import { TemplateController } from '../controllers/template.controller';

// Dependency Injection
const prismaService = PrismaService.getInstance();
const templateRepository = new TemplateRepository(prismaService.client);
const templateService = new TemplateService(templateRepository);
const templateController = new TemplateController(templateService);

const router = Router();

router.use(requireAuthWithSync);

// GET /templates
router.get('/', templateController.getAll);

// POST /templates
router.post('/', templateController.create);

// PUT /templates/:id
router.put('/:id', templateController.update);

// DELETE /templates/:id
router.delete('/:id', templateController.delete);

// POST /templates/:id/assign
router.post('/:id/assign', templateController.assign);

// POST /templates/:id/unassign
router.post('/:id/unassign', templateController.unassign);

export default router;
