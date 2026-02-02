import { client } from '@/api';

import type {
  ApiResponse,
  CreateSosMedicineData,
  LogSosMedicineData,
  SosMedicine,
  SosMedicineLog,
  SosMedicineStats,
  UpdateSosMedicineData,
} from './types';

export const sosMedicineApi = {
  getAll: async (): Promise<SosMedicine[]> => {
    const response = await client.get<ApiResponse<SosMedicine[]>>('/sos-medicines');
    return response.data.data || [];
  },

  getActive: async (): Promise<SosMedicine[]> => {
    const response = await client.get<ApiResponse<SosMedicine[]>>('/sos-medicines/active');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<SosMedicine> => {
    const response = await client.get<ApiResponse<SosMedicine>>(`/sos-medicines/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'SOS medicine not found');
    }
    return response.data.data;
  },

  create: async (data: CreateSosMedicineData): Promise<SosMedicine> => {
    const response = await client.post<ApiResponse<SosMedicine>>('/sos-medicines', data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create SOS medicine');
    }
    return response.data.data;
  },

  update: async (id: string, data: UpdateSosMedicineData): Promise<SosMedicine> => {
    const response = await client.put<ApiResponse<SosMedicine>>(`/sos-medicines/${id}`, data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update SOS medicine');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete<ApiResponse>(`/sos-medicines/${id}`);
  },

  log: async (id: string, data: LogSosMedicineData): Promise<SosMedicineLog> => {
    const response = await client.post<ApiResponse<SosMedicineLog>>(`/sos-medicines/${id}/log`, data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to log SOS medicine');
    }
    return response.data.data;
  },

  getLogs: async (id: string): Promise<SosMedicineLog[]> => {
    const response = await client.get<ApiResponse<SosMedicineLog[]>>(`/sos-medicines/${id}/logs`);
    return response.data.data || [];
  },

  getAllLogs: async (startDate?: string, endDate?: string): Promise<SosMedicineLog[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await client.get<ApiResponse<SosMedicineLog[]>>(
      `/sos-medicines/logs/all?${params.toString()}`
    );
    return response.data.data || [];
  },

  getStats: async (startDate?: string, endDate?: string): Promise<SosMedicineStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await client.get<ApiResponse<SosMedicineStats>>(
      `/sos-medicines/stats?${params.toString()}`
    );
    return (
      response.data.data || {
        totalUses: 0,
        uniqueMedicinesUsed: 0,
        totalMedicines: 0,
      }
    );
  },
};
