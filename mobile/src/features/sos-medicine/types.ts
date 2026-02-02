export interface CreateSosMedicineData {
  name: string;
  purpose?: string;
  dosage?: string;
  instructions?: string;
}

export interface UpdateSosMedicineData {
  name?: string;
  purpose?: string;
  dosage?: string;
  instructions?: string;
  isActive?: boolean;
}

export interface LogSosMedicineData {
  takenAt: string; // ISO string
  notes?: string;
}

export interface SosMedicine {
  id: string;
  userId: string;
  name: string;
  purpose: string | null;
  dosage: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SosMedicineLog {
  id: string;
  sosMedicineId: string;
  takenAt: string;
  notes: string | null;
  createdAt: string;
  sosMedicine?: SosMedicine;
}

export interface SosMedicineStats {
  totalUses: number;
  uniqueMedicinesUsed: number;
  totalMedicines: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}
