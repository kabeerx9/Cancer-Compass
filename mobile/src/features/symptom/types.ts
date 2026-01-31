export interface SymptomLog {
  id: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSymptomLogData {
  date: string;
  content: string;
}

export interface UpdateSymptomLogData {
  content: string;
}

export interface SymptomSummary {
  summary: string;
  logs: SymptomLog[];
  daysCount: number;
  entriesCount: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}
