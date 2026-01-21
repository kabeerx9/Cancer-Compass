/**
 * API types - request/response shapes for the backend API
 */

// =============================================================================
// GENERIC API RESPONSE WRAPPER
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// AUTH API
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  token: string;
}

// =============================================================================
// MEDICATION API
// =============================================================================

export interface CreateMedicationRequest {
  name: string;
  purpose?: string;
  dosage?: string;
  time?: string;
  timeLabel?: string;
}

export interface UpdateMedicationRequest {
  name?: string;
  purpose?: string;
  dosage?: string;
  time?: string;
  timeLabel?: string;
  isActive?: boolean;
}

// =============================================================================
// TASK API
// =============================================================================

export interface CreateTaskRequest {
  date: string; // ISO date string
  taskTitle: string;
  taskDescription?: string;
}

export interface UpdateTaskRequest {
  taskTitle?: string;
  taskDescription?: string;
  isCompleted?: boolean;
}

// =============================================================================
// TEMPLATE API
// =============================================================================

export interface CreateTemplateRequest {
  name: string;
  color: string;
  tasks?: {
    taskTitle: string;
    taskDescription?: string;
    order: number;
  }[];
}

export interface UpdateTemplateRequest {
  name?: string;
  color?: string;
}

export interface AssignTemplateRequest {
  date: string; // ISO date string
  templateId: string;
}

// =============================================================================
// DOCUMENT API
// =============================================================================

export interface UploadDocumentRequest {
  title: string;
  category: string;
  date: string;
  notes?: string;
  // File will be handled separately via multipart form
}

// =============================================================================
// TREATMENT CYCLE API
// =============================================================================

export interface CreateCycleRequest {
  cycleNumber: number;
  infusionDate: string;
  notes?: string;
}

export interface UpdateCycleRequest {
  infusionDate?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}
