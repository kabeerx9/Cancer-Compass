import { clerkClient, getAuth, requireAuth } from '@clerk/express';
import { NextFunction, Request, Response } from 'express';
import { unifiedResponse } from 'uni-response';

import { PrismaService } from '../config/prisma.config';

// Get Prisma instance
const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;

// Augment the Express Request object to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clerkId: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
      };
    }
  }
}

/**
 * Middleware that requires authentication and syncs user to database
 * Uses Clerk's requireAuth() and auto-creates users on first request
 */
export const requireAuthWithSync = [
  requireAuth(),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get auth from request (userId is the clerkId)
      const { userId } = getAuth(req);

      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      // Check if user exists in database
      let user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: {
          id: true,
          clerkId: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      // If user doesn't exist, fetch from Clerk and create
      if (!user) {
        try {
          const clerkUser = await clerkClient.users.getUser(userId);

          // Create user in database
          user = await prisma.user.create({
            data: {
              clerkId: userId,
              email: clerkUser.emailAddresses[0]?.emailAddress || null,
              firstName: clerkUser.firstName || null,
              lastName: clerkUser.lastName || null,
            },
            select: {
              id: true,
              clerkId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          });

          req.log?.info({ clerkId: userId }, 'New user synced from Clerk');
        } catch (error) {
          req.log?.error({ error, clerkId: userId }, 'Failed to sync user from Clerk');
          res.status(500).json(unifiedResponse(false, 'Failed to sync user'));
          return;
        }
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      req.log?.error({ error }, 'Authentication error');
      res.status(401).json(unifiedResponse(false, 'Authentication failed'));
      return;
    }
  },
];

/**
 * Optional auth middleware that syncs user if authenticated
 * Does not require authentication - continues even if not authenticated
 */
export const optionalAuthWithSync = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      // Not authenticated - continue without user
      next();
      return;
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // If user doesn't exist, fetch from Clerk and create
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);

        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || null,
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
          },
          select: {
            id: true,
            clerkId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });

        req.log?.info({ clerkId: userId }, 'New user synced from Clerk');
      } catch (error) {
        req.log?.error({ error, clerkId: userId }, 'Failed to sync user from Clerk');
        // Continue without user rather than failing the request
      }
    }

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    req.log?.error({ error }, 'Optional auth error');
    // Continue without user rather than failing the request
    next();
  }
};
