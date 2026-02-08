import { unifiedResponse } from 'uni-response';
import { randomUUID } from 'crypto';

import {
  CreateMedicationInput,
  MedicationRepository,
  UpdateMedicationInput,
} from '../repositories/medication.repository';

// Input type for multi-timing medication creation
export interface CreateMedicationServiceInput {
  name: string;
  purpose?: string;
  timeSlots: Array<{
    timeSlotId: number;
    dosage?: string;
    time?: string;
  }>;
}

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

  async createMedication(data: CreateMedicationServiceInput, userId: string) {
    // Generate groupId if multiple time slots
    const groupId = data.timeSlots.length > 1 ? randomUUID() : undefined;

    // Create separate entry for each time slot
    const createdMedications = await Promise.all(
      data.timeSlots.map((slot) =>
        this.medicationRepository.create({
          userId,
          name: data.name,
          purpose: data.purpose,
          dosage: slot.dosage,
          time: slot.time,
          timeSlotId: slot.timeSlotId,
          groupId,
        })
      )
    );

    return unifiedResponse(true, 'Medication(s) created', createdMedications);
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
