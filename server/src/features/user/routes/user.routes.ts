import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { requireAuthWithSync } from '../../../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';

// Dependency Injection
const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

// Public routes
router.get('/', userController.heartbeat);
router.get('/test/public', userController.testPublic);

// Protected routes - require Clerk authentication
router.get('/test/authenticated', requireAuthWithSync, userController.testAuthenticated);
router.get('/profile', requireAuthWithSync, userController.getProfile);

export default router;
