import { client } from '@/api';
import { ApiResponse, CreateTemplateData, DayTemplate, UpdateTemplateData } from './types';

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

  assign: async (id: string, date: string): Promise<void> => {
      // date should be YYYY-MM-DD
    await client.post<ApiResponse>(`/templates/${id}/assign`, { date });
  },
};
