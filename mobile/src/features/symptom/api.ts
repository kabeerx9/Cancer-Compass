import { client } from '@/api';

import type {
  ApiResponse,
  CreateSymptomLogData,
  SymptomLog,
  SymptomSummary,
  UpdateSymptomLogData,
} from './types';

export const symptomApi = {
  getAll: async (): Promise<SymptomLog[]> => {
    const response = await client.get<ApiResponse<SymptomLog[]>>('/symptoms');
    return response.data.data || [];
  },

  checkToday: async (): Promise<boolean> => {
    const response = await client.get<ApiResponse<{ hasLog: boolean }>>('/symptoms/today');
    return response.data.data?.hasLog || false;
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<SymptomLog[]> => {
    const response = await client.get<ApiResponse<SymptomLog[]>>(
      `/symptoms/range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.data || [];
  },

  getSummary: async (startDate: string, endDate: string): Promise<SymptomSummary> => {
    const response = await client.get<ApiResponse<SymptomSummary>>(
      `/symptoms/summary?startDate=${startDate}&endDate=${endDate}`
    );
    return (
      response.data.data || {
        summary: '',
        logs: [],
        daysCount: 0,
        entriesCount: 0,
      }
    );
  },

  createOrUpdate: async (data: CreateSymptomLogData): Promise<SymptomLog> => {
    const response = await client.post<ApiResponse<SymptomLog>>('/symptoms', data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to save symptom log');
    }
    return response.data.data;
  },

  update: async (id: string, data: UpdateSymptomLogData): Promise<SymptomLog> => {
    const response = await client.put<ApiResponse<SymptomLog>>(`/symptoms/${id}`, data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update symptom log');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete<ApiResponse>(`/symptoms/${id}`);
  },
};
