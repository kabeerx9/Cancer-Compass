// Patient Info Types
export interface PatientInfo {
  id: string;
  userId: string;
  name: string | null;
  dateOfBirth: string | null;
  bloodType: string | null;
  allergies: string | null;
  diagnosis: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePatientInfoData {
  name?: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string;
  diagnosis?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

// Contact Types
export type ContactCategory = 'medical_team' | 'hospital' | 'logistics' | 'personal';

export interface Contact {
  id: string;
  userId: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  category: ContactCategory;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactData {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  category: ContactCategory;
  notes?: string;
}

export interface UpdateContactData {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  category?: ContactCategory;
  notes?: string;
}

// API Response Type
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}

// Category label mapping
export const CATEGORY_LABELS: Record<ContactCategory, string> = {
  medical_team: 'Medical Team',
  hospital: 'Hospital',
  logistics: 'Logistics',
  personal: 'Personal',
};

export const CATEGORY_ICONS: Record<ContactCategory, string> = {
  medical_team: '👨‍⚕️',
  hospital: '🏥',
  logistics: '🚗',
  personal: '👥',
};

// Blood type options
export const BLOOD_TYPE_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const;
