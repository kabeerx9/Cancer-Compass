import { unifiedResponse } from 'uni-response';

import {
  CreateSymptomLogInput,
  SymptomRepository,
  UpdateSymptomLogInput,
} from '../repositories/symptom.repository';

export class SymptomService {
  constructor(private readonly symptomRepository: SymptomRepository) {}

  async getAllSymptomLogs(userId: string) {
    const logs = await this.symptomRepository.findAllByUserId(userId);
    return unifiedResponse(true, 'Symptom logs retrieved', logs);
  }

  async getSymptomLogByDate(userId: string, date: Date) {
    const log = await this.symptomRepository.findByDate(userId, date);
    if (!log) {
      return unifiedResponse(false, 'No symptom log found for this date');
    }
    return unifiedResponse(true, 'Symptom log retrieved', log);
  }

  async getSymptomLogsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    const logs = await this.symptomRepository.findByDateRange(userId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    return unifiedResponse(true, 'Symptom logs retrieved', logs);
  }

  async createOrUpdateSymptomLog(
    data: Omit<CreateSymptomLogInput, 'userId'>,
    userId: string
  ) {
    const log = await this.symptomRepository.create({
      ...data,
      userId,
    });
    return unifiedResponse(true, 'Symptom log saved', log);
  }

  async updateSymptomLog(
    id: string,
    data: UpdateSymptomLogInput,
    userId: string
  ) {
    // Verify ownership
    const existing = await this.symptomRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'Symptom log not found');
    }

    const log = await this.symptomRepository.update(id, data);
    return unifiedResponse(true, 'Symptom log updated', log);
  }

  async deleteSymptomLog(id: string, userId: string) {
    // Verify ownership
    const existing = await this.symptomRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'Symptom log not found');
    }

    await this.symptomRepository.delete(id);
    return unifiedResponse(true, 'Symptom log deleted');
  }

  async checkTodayLog(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasLog = await this.symptomRepository.hasLogForToday(userId, today);
    return unifiedResponse(true, 'Checked today\'s log status', { hasLog });
  }

  async generateSummary(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    const logs = await this.symptomRepository.findByDateRange(userId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    if (logs.length === 0) {
      return unifiedResponse(true, 'No symptom logs found for the selected period', {
        summary: 'No symptom entries recorded during this time period.',
        logs: [],
        daysCount: 0,
        entriesCount: 0,
      });
    }

    // For now, return a placeholder AI summary
    // Later this will call an AI service
    const daysCount = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const summary = `Summary for ${logs.length} symptom entries over ${daysCount} days:\n\n` +
      `Key observations from this period:\n` +
      `- Total entries: ${logs.length}\n` +
      `- Average entries per day: ${(logs.length / daysCount).toFixed(1)}\n\n` +
      `Recent entries include symptoms logged on: ${logs
        .slice(0, 3)
        .map((l) => l.date.toLocaleDateString())
        .join(', ')}${logs.length > 3 ? '...' : ''}`;

    return unifiedResponse(true, 'Summary generated', {
      summary,
      logs,
      daysCount,
      entriesCount: logs.length,
    });
  }
}
