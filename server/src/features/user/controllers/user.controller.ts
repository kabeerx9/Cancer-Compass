import { getAuth } from '@clerk/express';
import { NextFunction, Request, Response } from 'express';
import { unifiedResponse } from 'uni-response';

import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  heartbeat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userService.heartbeat();
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Test endpoint - public, no auth required
   */
  testPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(
        unifiedResponse(true, 'Public endpoint working', {
          message: 'This endpoint does not require authentication',
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Test endpoint - requires authentication
   * Returns Clerk user data and database user data
   */
  testAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId: clerkId } = getAuth(req);
      const dbUser = req.user; // Attached by our custom middleware

      res.status(200).json(
        unifiedResponse(true, 'Authenticated endpoint working', {
          clerkId,
          dbUser,
          message: 'User is authenticated and synced to database',
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user profile from database
   * Uses the user attached by our custom middleware
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(404).json(unifiedResponse(false, 'User not found'));
        return;
      }

      // Optionally fetch fresh data from database
      const result = await this.userService.getProfile(user.id);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };
}
