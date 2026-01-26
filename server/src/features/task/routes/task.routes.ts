import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { requireAuthWithSync } from '../../../middleware/auth.middleware';
import { TaskController } from '../controllers/task.controller';
import { TaskRepository } from '../repositories/task.repository';
import { TaskService } from '../services/task.service';

// Dependency Injection
const prismaService = PrismaService.getInstance();
const taskRepository = new TaskRepository(prismaService.client);
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

const router = Router();

router.use(requireAuthWithSync);

// GET /tasks?date=YYYY-MM-DD
router.get('/', taskController.getAll);

// POST /tasks
router.post('/', taskController.create);

// PUT /tasks/:id
router.put('/:id', taskController.update);

// PATCH /tasks/:id/toggle
router.patch('/:id/toggle', taskController.toggleComplete);

// DELETE /tasks/:id
router.delete('/:id', taskController.delete);

export default router;
