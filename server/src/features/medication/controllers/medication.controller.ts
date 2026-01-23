import { NextFunction, Request, Response } from 'express';
import { unifiedResponse } from 'uni-response';

import { MedicationService } from '../services/medication.service';

export class MedicationController {
  constructor(private medicationService: MedicationService) {}

  /**
   * GET /medications
   * Get all medications for the authenticated user
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const result = await this.medicationService.getAllMedications(userId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /medications/today
   * Get today's medications with status
   */
  getToday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const result = await this.medicationService.getTodaysMedications(userId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /medications/:id
   * Get a specific medication
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { id } = req.params;
      const result = await this.medicationService.getMedicationById(id, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /medications
   * Create a new medication
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { name, purpose, dosage, time, timeLabel } = req.body;

      if (!name) {
        res.status(400).json(unifiedResponse(false, 'Name is required'));
        return;
      }

      const result = await this.medicationService.createMedication(
        { name, purpose, dosage, time, timeLabel },
        userId,
      );
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /medications/:id
   * Update a medication
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { id } = req.params;
      const { name, purpose, dosage, time, timeLabel, isActive } = req.body;

      const result = await this.medicationService.updateMedication(
        id,
        { name, purpose, dosage, time, timeLabel, isActive },
        userId,
      );
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /medications/:id
   * Delete a medication
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { id } = req.params;
      const result = await this.medicationService.deleteMedication(id, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /medications/:id/log
   * Log a medication as taken or skipped
   */
  log = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['taken', 'skipped'].includes(status)) {
        res.status(400).json(unifiedResponse(false, 'Status must be "taken" or "skipped"'));
        return;
      }

      const result = await this.medicationService.logMedication(id, status, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };
}
