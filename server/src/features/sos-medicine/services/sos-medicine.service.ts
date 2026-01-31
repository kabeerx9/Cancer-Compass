import { unifiedResponse } from 'uni-response';

import {
  CreateSosMedicineInput,
  LogSosMedicineInput,
  SosMedicineRepository,
  UpdateSosMedicineInput,
} from '../repositories/sos-medicine.repository';

export class SosMedicineService {
  constructor(private readonly sosMedicineRepository: SosMedicineRepository) {}

  async getAllSosMedicines(userId: string) {
    const medicines = await this.sosMedicineRepository.findAllByUserId(userId);
    return unifiedResponse(true, 'SOS medicines retrieved', medicines);
  }

  async getActiveSosMedicines(userId: string) {
    const medicines = await this.sosMedicineRepository.findActiveByUserId(userId);
    return unifiedResponse(true, 'Active SOS medicines retrieved', medicines);
  }

  async getSosMedicineById(id: string, userId: string) {
    const medicine = await this.sosMedicineRepository.findById(id);

    if (!medicine) {
      return unifiedResponse(false, 'SOS medicine not found');
    }

    // Verify ownership
    if (medicine.userId !== userId) {
      return unifiedResponse(false, 'Unauthorized');
    }

    return unifiedResponse(true, 'SOS medicine retrieved', medicine);
  }

  async createSosMedicine(data: Omit<CreateSosMedicineInput, 'userId'>, userId: string) {
    const medicine = await this.sosMedicineRepository.create({
      ...data,
      userId,
    });
    return unifiedResponse(true, 'SOS medicine created', medicine);
  }

  async updateSosMedicine(id: string, data: UpdateSosMedicineInput, userId: string) {
    // Verify ownership
    const existing = await this.sosMedicineRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'SOS medicine not found');
    }

    const medicine = await this.sosMedicineRepository.update(id, data);
    return unifiedResponse(true, 'SOS medicine updated', medicine);
  }

  async deleteSosMedicine(id: string, userId: string) {
    // Verify ownership
    const existing = await this.sosMedicineRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'SOS medicine not found');
    }

    await this.sosMedicineRepository.delete(id);
    return unifiedResponse(true, 'SOS medicine deleted');
  }

  async logSosMedicine(
    sosMedicineId: string,
    data: Omit<LogSosMedicineInput, 'sosMedicineId'>,
    userId: string
  ) {
    // Verify ownership
    const existing = await this.sosMedicineRepository.findByIdAndUserId(sosMedicineId, userId);
    if (!existing) {
      return unifiedResponse(false, 'SOS medicine not found');
    }

    const log = await this.sosMedicineRepository.logSosMedicine({
      sosMedicineId,
      takenAt: data.takenAt,
      notes: data.notes,
    });

    return unifiedResponse(true, 'SOS medicine logged', log);
  }

  async getLogsByMedicineId(sosMedicineId: string, userId: string) {
    // Verify ownership
    const existing = await this.sosMedicineRepository.findByIdAndUserId(sosMedicineId, userId);
    if (!existing) {
      return unifiedResponse(false, 'SOS medicine not found');
    }

    const logs = await this.sosMedicineRepository.getLogsByMedicineId(sosMedicineId);
    return unifiedResponse(true, 'SOS medicine logs retrieved', logs);
  }

  async getAllLogs(userId: string, startDate?: string, endDate?: string) {
    let logs;

    if (startDate && endDate) {
      logs = await this.sosMedicineRepository.getLogsByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      logs = await this.sosMedicineRepository.getAllLogsByUserId(userId);
    }

    return unifiedResponse(true, 'SOS medicine logs retrieved', logs);
  }

  async getStats(userId: string, startDate?: string, endDate?: string) {
    const stats = await this.sosMedicineRepository.getStatsByUserId(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return unifiedResponse(true, 'SOS medicine stats retrieved', stats);
  }
}
