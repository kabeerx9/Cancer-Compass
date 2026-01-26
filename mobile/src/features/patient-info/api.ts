import { client } from '@/api';

import type {
  ApiResponse,
  Contact,
  CreateContactData,
  PatientInfo,
  UpdateContactData,
  UpdatePatientInfoData,
} from './types';

export const patientInfoApi = {
  // ============================================
  // PATIENT INFO
  // ============================================

  getPatientInfo: async (): Promise<PatientInfo | null> => {
    const response = await client.get<ApiResponse<PatientInfo>>('/patient-info');
    return response.data.data || null;
  },

  updatePatientInfo: async (data: UpdatePatientInfoData): Promise<PatientInfo> => {
    const response = await client.put<ApiResponse<PatientInfo>>('/patient-info', data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update patient info');
    }
    return response.data.data;
  },

  // ============================================
  // CONTACTS
  // ============================================

  getAllContacts: async (): Promise<Contact[]> => {
    const response = await client.get<ApiResponse<Contact[]>>('/patient-info/contacts');
    return response.data.data || [];
  },

  getContactsByCategory: async (category: string): Promise<Contact[]> => {
    const response = await client.get<ApiResponse<Contact[]>>(
      `/patient-info/contacts?category=${category}`
    );
    return response.data.data || [];
  },

  getContactById: async (id: string): Promise<Contact> => {
    const response = await client.get<ApiResponse<Contact>>(`/patient-info/contacts/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Contact not found');
    }
    return response.data.data;
  },

  createContact: async (data: CreateContactData): Promise<Contact> => {
    const response = await client.post<ApiResponse<Contact>>('/patient-info/contacts', data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create contact');
    }
    return response.data.data;
  },

  updateContact: async (id: string, data: UpdateContactData): Promise<Contact> => {
    const response = await client.put<ApiResponse<Contact>>(
      `/patient-info/contacts/${id}`,
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update contact');
    }
    return response.data.data;
  },

  deleteContact: async (id: string): Promise<void> => {
    await client.delete<ApiResponse>(`/patient-info/contacts/${id}`);
  },

  // ============================================
  // SHARE
  // ============================================

  getShareableText: async (): Promise<string> => {
    const response = await client.get<ApiResponse<{ text: string }>>('/patient-info/share');
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to generate shareable text');
    }
    return response.data.data.text;
  },
};
