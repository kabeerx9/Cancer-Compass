import { api } from '../../api';
import type {
  Medication,
  CreateMedicationData,
  UpdateMedicationData,
  ApiResponse,
} from './types';

export const medicationApi = {
  getAll: async (): Promise<Medication[]> => {
    const response = await api.get<ApiResponse<Medication[]>>('/medications');
    return response.data.data || [];
  },

  getToday: async (): Promise<Medication[]> => {
    const response = await api.get<ApiResponse<Medication[]>>('/medications/today');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Medication> => {
    const response = await api.get<ApiResponse<Medication>>(`/medications/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Medication not found');
    }
    return response.data.data;
  },

  create: async (data: CreateMedicationData): Promise<Medication> => {
    const response = await api.post<ApiResponse<Medication>>('/medications', data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create medication');
    }
    return response.data.data;
  },

  update: async (id: string, data: UpdateMedicationData): Promise<Medication> => {
    const response = await api.put<ApiResponse<Medication>>(`/medications/${id}`, data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update medication');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/medications/${id}`);
  },

  log: async (id: string, status: 'taken' | 'skipped'): Promise<void> => {
    await api.post<ApiResponse>(`/medications/${id}/log`, { status });
  },
};
