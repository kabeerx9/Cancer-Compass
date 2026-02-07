import { NextFunction, Request, Response } from 'express';
import { unifiedResponse } from 'uni-response';

import { MedicationRepository } from '../../medication/repositories/medication.repository';
import { PatientInfoService } from '../services/patient-info.service';

export class PatientInfoController {
  constructor(
    private patientInfoService: PatientInfoService,
    private medicationRepository: MedicationRepository,
  ) {}

  private getParamValue(param: string | string[] | undefined): string | null {
    if (typeof param === 'string') {
      return param;
    }

    if (Array.isArray(param) && typeof param[0] === 'string') {
      return param[0];
    }

    return null;
  }

  // ============================================
  // PATIENT INFO
  // ============================================

  /**
   * GET /patient-info
   * Get patient info for the authenticated user
   */
  getPatientInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const result = await this.patientInfoService.getPatientInfo(userId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /patient-info
   * Update patient info for the authenticated user
   */
  updatePatientInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const {
        name,
        dateOfBirth,
        bloodType,
        allergies,
        diagnosis,
        insuranceProvider,
        insurancePolicyNumber,
        emergencyContactName,
        emergencyContactPhone,
        notes,
      } = req.body;

      const result = await this.patientInfoService.updatePatientInfo(
        {
          name,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          bloodType,
          allergies,
          diagnosis,
          insuranceProvider,
          insurancePolicyNumber,
          emergencyContactName,
          emergencyContactPhone,
          notes,
        },
        userId,
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // CONTACTS
  // ============================================

  /**
   * GET /patient-info/contacts
   * Get all contacts for the authenticated user
   */
  getAllContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { category } = req.query;

      let result;
      if (category && typeof category === 'string') {
        result = await this.patientInfoService.getContactsByCategory(userId, category);
      } else {
        result = await this.patientInfoService.getAllContacts(userId);
      }

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /patient-info/contacts/:id
   * Get a specific contact
   */
  getContactById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = this.getParamValue(req.params.id);
      if (!id) {
        res.status(400).json(unifiedResponse(false, 'Invalid contact id'));
        return;
      }

      const result = await this.patientInfoService.getContactById(id, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /patient-info/contacts
   * Create a new contact
   */
  createContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const { name, role, phone, email, category, notes } = req.body;

      if (!name) {
        res.status(400).json(unifiedResponse(false, 'Name is required'));
        return;
      }

      if (!category || !['medical_team', 'hospital', 'logistics', 'personal'].includes(category)) {
        res.status(400).json(unifiedResponse(false, 'Valid category is required'));
        return;
      }

      const result = await this.patientInfoService.createContact(
        { name, role, phone, email, category, notes },
        userId,
      );
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /patient-info/contacts/:id
   * Update a contact
   */
  updateContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = this.getParamValue(req.params.id);
      if (!id) {
        res.status(400).json(unifiedResponse(false, 'Invalid contact id'));
        return;
      }

      const { name, role, phone, email, category, notes } = req.body;

      if (category && !['medical_team', 'hospital', 'logistics', 'personal'].includes(category)) {
        res.status(400).json(unifiedResponse(false, 'Invalid category'));
        return;
      }

      const result = await this.patientInfoService.updateContact(
        id,
        { name, role, phone, email, category, notes },
        userId,
      );
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /patient-info/contacts/:id
   * Delete a contact
   */
  deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      const id = this.getParamValue(req.params.id);
      if (!id) {
        res.status(400).json(unifiedResponse(false, 'Invalid contact id'));
        return;
      }

      const result = await this.patientInfoService.deleteContact(id, userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // SHARE
  // ============================================

  /**
   * GET /patient-info/share
   * Generate shareable text with patient info, medications, and contacts
   */
  getShareableText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(unifiedResponse(false, 'Unauthorized'));
        return;
      }

      // Get active medications for the user
      const medications = await this.medicationRepository.findActiveByUserId(userId);

      const result = await this.patientInfoService.generateShareableText(
        userId,
        medications.map(m => ({
          name: m.name,
          dosage: m.dosage,
          time: m.time,
          timeLabel: m.timeLabel,
        })),
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };
}
