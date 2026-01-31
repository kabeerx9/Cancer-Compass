import { NextFunction, Request, Response } from 'express';
import { unifiedResponse } from 'uni-response';

import { SosMedicineService } from '../services/sos-medicine.service';

export class SosMedicineController {
  constructor(private sosMedicineService: SosMedicineService) {}

  /**
   * GET /sos-medicines
   * Get all SOS medicines for the authenticated user
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const result = await this.sosMedicineService.getAllSosMedicines(userId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /sos-medicines/active
   * Get active SOS medicines for the authenticated user
   */
  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const result = await this.sosMedicineService.getActiveSosMedicines(userId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /sos-medicines/:id
   * Get a specific SOS medicine
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.sosMedicineService.getSosMedicineById(id, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /sos-medicines
   * Create a new SOS medicine
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { name, purpose, dosage, instructions } = req.body;

      if (!name) {
        res.status(400).json(unifiedResponse(false, 'Name is required'));
        return;
      }

      const result = await this.sosMedicineService.createSosMedicine(
        { name, purpose, dosage, instructions },
        userId,
      );
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /sos-medicines/:id
   * Update a SOS medicine
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { name, purpose, dosage, instructions, isActive } = req.body;

      const result = await this.sosMedicineService.updateSosMedicine(
        id,
        { name, purpose, dosage, instructions, isActive },
        userId,
      );
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /sos-medicines/:id
   * Delete a SOS medicine
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.sosMedicineService.deleteSosMedicine(id, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /sos-medicines/:id/log
   * Log a SOS medicine as taken
   */
  log = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { takenAt, notes } = req.body;

      const result = await this.sosMedicineService.logSosMedicine(
        id,
        { takenAt: takenAt ? new Date(takenAt) : new Date(), notes },
        userId,
      );
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /sos-medicines/:id/logs
   * Get logs for a specific SOS medicine
   */
  getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.sosMedicineService.getLogsByMedicineId(id, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /sos-medicines/logs/all
   * Get all logs for the authenticated user
   */
  getAllLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { startDate, endDate } = req.query;
      const result = await this.sosMedicineService.getAllLogs(
        userId,
        startDate as string | undefined,
        endDate as string | undefined,
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /sos-medicines/stats
   * Get stats for SOS medicines
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { startDate, endDate } = req.query;
      const result = await this.sosMedicineService.getStats(
        userId,
        startDate as string | undefined,
        endDate as string | undefined,
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };
}
