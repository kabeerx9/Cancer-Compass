export interface DailyTask {
  id: string;
  userId: string;
  date: string; // ISO Date string
  title: string;
  description: string | null;
  isCompleted: boolean;
  order: number;
  sourceType: 'custom' | 'template'; // 'custom' | 'template'
  templateId: string | null;
  templateTaskId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  order?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}
