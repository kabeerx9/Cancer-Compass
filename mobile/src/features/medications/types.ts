export interface CreateMedicationData {
  name: string;
  purpose?: string;
  dosage?: string;
  time?: string;
  timeLabel?: string;
}

export interface UpdateMedicationData {
  name?: string;
  purpose?: string;
  dosage?: string;
  time?: string;
  timeLabel?: string;
  isActive?: boolean;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  purpose: string | null;
  dosage: string | null;
  time: string | null;
  timeLabel: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  logs?: MedicationLog[];
  todayStatus?: 'taken' | 'skipped' | null;
  todayTakenAt?: string | null;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  date: string;
  status: 'taken' | 'skipped';
  takenAt: string | null;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}
