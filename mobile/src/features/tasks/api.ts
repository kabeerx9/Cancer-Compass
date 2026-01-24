import { client } from '@/api';

import type {
  ApiResponse,
  CreateTaskData,
  DailyTask,
  UpdateTaskData,
} from './types';

export const taskApi = {
  getByDate: async (date: string): Promise<DailyTask[]> => {
    // date should be YYYY-MM-DD
    const response = await client.get<ApiResponse<DailyTask[]>>(`/tasks`, {
      params: { date },
    });
    return response.data.data || [];
  },

  create: async (data: CreateTaskData): Promise<DailyTask> => {
    const response = await client.post<ApiResponse<DailyTask>>('/tasks', data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create task');
    }
    return response.data.data;
  },

  update: async (id: string, data: UpdateTaskData): Promise<DailyTask> => {
    const response = await client.put<ApiResponse<DailyTask>>(
      `/tasks/${id}`,
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update task');
    }
    return response.data.data;
  },

  toggleComplete: async (id: string): Promise<DailyTask> => {
    const response = await client.patch<ApiResponse<DailyTask>>(
      `/tasks/${id}/toggle`
    );
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to toggle task');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete<ApiResponse>(`/tasks/${id}`);
  },
};
