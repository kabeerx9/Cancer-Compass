export interface TemplateTask {
  id: string;
  templateId: string;
  title: string;
  order: number;
}

export interface DayTemplate {
  id: string;
  userId: string;
  name: string;
  color: string;
  tasks: TemplateTask[];
  createdAt: string;
}

export interface CreateTemplateData {
  name: string;
  color?: string;
  tasks: {
    title: string;
    description?: string;
    order: number;
  }[];
}

export interface UpdateTemplateData {
  name?: string;
  color?: string;
  tasks?: {
    id?: string;
    title: string;
    description?: string;
    order: number;
  }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
