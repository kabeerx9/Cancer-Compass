import { NextFunction, Request, Response } from 'express';
import { unifiedResponse } from 'uni-response';

import { SymptomService } from '../services/symptom.service';

export class SymptomController {
  constructor(private symptomService: SymptomService) {}

  /**
   * GET /symptoms
   * Get all symptom logs for the authenticated user
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const result = await this.symptomService.getAllSymptomLogs(userId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /symptoms/today
   * Check if user has logged symptoms for today
   */
  checkToday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const result = await this.symptomService.checkTodayLog(userId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /symptoms/range
   * Get symptom logs for a date range
   */
  getByDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json(unifiedResponse(false, 'Start date and end date are required'));
        return;
      }

      const result = await this.symptomService.getSymptomLogsByDateRange(
        userId,
        startDate as string,
        endDate as string
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /symptoms/summary
   * Generate AI summary for a date range
   */
  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json(unifiedResponse(false, 'Start date and end date are required'));
        return;
      }

      const result = await this.symptomService.generateSummary(
        userId,
        startDate as string,
        endDate as string
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /symptoms
   * Create or update a symptom log
   */
  createOrUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { date, content } = req.body;
      if (!date || !content) {
        res.status(400).json(unifiedResponse(false, 'Date and content are required'));
        return;
      }

      const result = await this.symptomService.createOrUpdateSymptomLog(
        { date: new Date(date), content },
        userId
      );
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /symptoms/:id
   * Update a symptom log
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { content } = req.body;

      const result = await this.symptomService.updateSymptomLog(id, { content }, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /symptoms/:id
   * Delete a symptom log
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.symptomService.deleteSymptomLog(id, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };
}
