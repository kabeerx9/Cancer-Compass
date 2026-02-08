/**
 * Entity types - mirrors Prisma schema models
 * These are the core data types used across the app
 */

// =============================================================================
// USER & AUTH
// =============================================================================

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  password?: string; // Omit in API responses
  roleId: string | null;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Relations
  role?: Role | null;
}

export interface Role {
  id: string;
  name: string;
  active: number;
}

// =============================================================================
// MEDICATIONS (from your plan.md)
// =============================================================================

// Time slot definitions with built-in sort order
export const TIME_SLOTS = {
  1: { id: 1, label: "Before Breakfast", sortOrder: 1 },
  2: { id: 2, label: "After Breakfast",  sortOrder: 2 },
  3: { id: 3, label: "Before Lunch",     sortOrder: 3 },
  4: { id: 4, label: "After Lunch",      sortOrder: 4 },
  5: { id: 5, label: "Before Dinner",    sortOrder: 5 },
  6: { id: 6, label: "After Dinner",     sortOrder: 6 },
  7: { id: 7, label: "Bedtime",          sortOrder: 7 },
} as const;

export type TimeSlotId = keyof typeof TIME_SLOTS;

// Helper to get label from timeSlotId
export const getTimeSlotLabel = (id: number | null | undefined): string | null => {
  if (!id || !(id in TIME_SLOTS)) return null;
  return TIME_SLOTS[id as TimeSlotId].label;
};

export interface Medication {
  id: string;
  userId: string;
  name: string;
  purpose: string | null;
  dosage: string | null;
  time: string | null;      // Time string like "08:00"
  timeSlotId: number | null; // 1-7, maps to TIME_SLOTS
  groupId: string | null;    // Links multi-timing entries
  isActive: boolean;
  createdAt: Date | string;
}

// =============================================================================
// DAY TEMPLATES & TASKS (from your plan.md)
// =============================================================================

export interface DayTemplate {
  id: string;
  userId: string;
  name: string;
  color: string; // Hex color code
  createdAt: Date | string;
  // Relations
  tasks?: TemplateTask[];
}

export interface TemplateTask {
  id: string;
  templateId: string;
  taskTitle: string;
  taskDescription: string | null;
  order: number;
  createdAt: Date | string;
}

export interface AssignedDay {
  id: string;
  userId: string;
  date: Date | string;
  templateId: string;
  createdAt: Date | string;
  // Relations
  template?: DayTemplate;
}

export interface DailyTask {
  id: string;
  userId: string;
  date: Date | string;
  taskTitle: string;
  taskDescription: string | null;
  isCompleted: boolean;
  isTemplateTask: boolean;
  templateId: string | null;
  documentId: string | null;
  createdAt: Date | string;
}

// =============================================================================
// DOCUMENTS
// =============================================================================

export type DocumentCategory =
  | 'medical_records'
  | 'insurance_billing'
  | 'prescriptions'
  | 'hospital_admin';

export interface Document {
  id: string;
  userId: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string; // e.g., "image/jpeg", "application/pdf"
  date: Date | string;
  notes: string | null;
  createdAt: Date | string;
}

// =============================================================================
// PATIENT INFO & CONTACTS
// =============================================================================

export interface PatientInfo {
  userId: string;
  name: string | null;
  dateOfBirth: Date | string | null;
  bloodType: string | null;
  allergies: string | null;
  primaryOncologist: string | null;
  oncologistPhone: string | null;
  hospitalName: string | null;
  hospitalPhone: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  updatedAt: Date | string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  role: string; // e.g., "Doctor", "Hospital"
  phone: string | null;
  email: string | null;
  createdAt: Date | string;
}

// =============================================================================
// TREATMENT CYCLES
// =============================================================================

export type CycleStatus = 'scheduled' | 'completed' | 'cancelled';

export interface TreatmentCycle {
  id: string;
  userId: string;
  cycleNumber: number;
  infusionDate: Date | string;
  status: CycleStatus;
  notes: string | null;
  createdAt: Date | string;
}
