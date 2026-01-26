import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { requireAuthWithSync } from '../../../middleware/auth.middleware';
import { MedicationRepository } from '../../medication/repositories/medication.repository';
import { PatientInfoController } from '../controllers/patient-info.controller';
import { PatientInfoRepository } from '../repositories/patient-info.repository';
import { PatientInfoService } from '../services/patient-info.service';

// Dependency Injection
const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const patientInfoRepository = new PatientInfoRepository(prisma);
const patientInfoService = new PatientInfoService(patientInfoRepository);
const medicationRepository = new MedicationRepository(prisma);
const patientInfoController = new PatientInfoController(patientInfoService, medicationRepository);

const router = Router();

// All routes require authentication
router.use(requireAuthWithSync);

// ============================================
// PATIENT INFO
// ============================================

// GET /patient-info - Get patient info
router.get('/', patientInfoController.getPatientInfo);

// PUT /patient-info - Update patient info
router.put('/', patientInfoController.updatePatientInfo);

// GET /patient-info/share - Get shareable text
router.get('/share', patientInfoController.getShareableText);

// ============================================
// CONTACTS
// ============================================

// GET /patient-info/contacts - Get all contacts
router.get('/contacts', patientInfoController.getAllContacts);

// GET /patient-info/contacts/:id - Get a specific contact
router.get('/contacts/:id', patientInfoController.getContactById);

// POST /patient-info/contacts - Create a new contact
router.post('/contacts', patientInfoController.createContact);

// PUT /patient-info/contacts/:id - Update a contact
router.put('/contacts/:id', patientInfoController.updateContact);

// DELETE /patient-info/contacts/:id - Delete a contact
router.delete('/contacts/:id', patientInfoController.deleteContact);

export default router;
