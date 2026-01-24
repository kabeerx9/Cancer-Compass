import { client } from '@/api';
import { ApiResponse, AssignedDay, CreateTemplateData, DayTemplate, UpdateTemplateData } from './types';

export const templateApi = {
  getAll: async (): Promise<DayTemplate[]> => {
    const response = await client.get<ApiResponse<DayTemplate[]>>('/templates');
    return response.data.data || [];
  },

  create: async (data: CreateTemplateData): Promise<DayTemplate> => {
    const response = await client.post<ApiResponse<DayTemplate>>('/templates', data);
    if (!response.data.data) throw new Error(response.data.message);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTemplateData): Promise<DayTemplate> => {
    const response = await client.put<ApiResponse<DayTemplate>>(`/templates/${id}`, data);
    if (!response.data.data) throw new Error(response.data.message);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete<ApiResponse>(`/templates/${id}`);
  },

  assign: async (id: string, date: string): Promise<AssignedDay> => {
    // date should be YYYY-MM-DD
    const response = await client.post<ApiResponse<AssignedDay>>(`/templates/${id}/assign`, { date });

    // Check success flag - if false, throw error to trigger onError
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to assign template');
    }

    return response.data.data;
  },

  unassign: async (id: string, date: string): Promise<void> => {
    await client.post<ApiResponse>(`/templates/${id}/unassign`, { date });
  },

  getAssignedDays: async (startDate: string, endDate: string): Promise<AssignedDay[]> => {
    const response = await client.get<ApiResponse<AssignedDay[]>>('/templates/assigned-days', {
      params: { startDate, endDate },
    });
    return response.data.data || [];
  },
};
