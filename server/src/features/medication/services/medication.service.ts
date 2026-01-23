import { unifiedResponse } from 'uni-response';

import {
  CreateMedicationInput,
  MedicationRepository,
  UpdateMedicationInput,
} from '../repositories/medication.repository';

export class MedicationService {
  constructor(private readonly medicationRepository: MedicationRepository) {}

  async getAllMedications(userId: string) {
    const medications = await this.medicationRepository.findAllByUserId(userId);
    return unifiedResponse(true, 'Medications retrieved', medications);
  }

  async getActiveMedications(userId: string) {
    const medications = await this.medicationRepository.findActiveByUserId(userId);
    return unifiedResponse(true, 'Active medications retrieved', medications);
  }

  async getMedicationById(id: string, userId: string) {
    const medication = await this.medicationRepository.findById(id);

    if (!medication) {
      return unifiedResponse(false, 'Medication not found');
    }

    // Verify ownership
    if (medication.userId !== userId) {
      return unifiedResponse(false, 'Unauthorized');
    }

    return unifiedResponse(true, 'Medication retrieved', medication);
  }

  async createMedication(data: Omit<CreateMedicationInput, 'userId'>, userId: string) {
    const medication = await this.medicationRepository.create({
      ...data,
      userId,
    });
    return unifiedResponse(true, 'Medication created', medication);
  }

  async updateMedication(id: string, data: UpdateMedicationInput, userId: string) {
    // Verify ownership
    const existing = await this.medicationRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'Medication not found');
    }

    const medication = await this.medicationRepository.update(id, data);
    return unifiedResponse(true, 'Medication updated', medication);
  }

  async deleteMedication(id: string, userId: string) {
    // Verify ownership
    const existing = await this.medicationRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'Medication not found');
    }

    await this.medicationRepository.delete(id);
    return unifiedResponse(true, 'Medication deleted');
  }

  async logMedication(medicationId: string, status: 'taken' | 'skipped', userId: string) {
    // Verify ownership
    const existing = await this.medicationRepository.findByIdAndUserId(medicationId, userId);
    if (!existing) {
      return unifiedResponse(false, 'Medication not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await this.medicationRepository.logMedication({
      medicationId,
      date: today,
      status,
      takenAt: status === 'taken' ? new Date() : undefined,
    });

    return unifiedResponse(true, `Medication marked as ${status}`, log);
  }

  async getTodaysMedications(userId: string) {
    const medications = await this.medicationRepository.findActiveByUserId(userId);

    // Transform to include today's status
    const withStatus = medications.map(med => ({
      ...med,
      todayStatus: med.logs[0]?.status || null,
      todayTakenAt: med.logs[0]?.takenAt || null,
    }));

    return unifiedResponse(true, "Today's medications retrieved", withStatus);
  }
}
