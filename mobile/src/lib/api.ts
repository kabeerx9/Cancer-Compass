// API configuration
// TODO: Update this URL when you deploy your backend
// const API_BASE_URL = "http://localhost:5000/v1";
const API_BASE_URL = "https://9851aba2c8bc.ngrok-free.app/v1";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Skip ngrok's browser warning page
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const text = await response.text();

    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      return data;
    } catch {
      // If not JSON, log the response for debugging
      console.error("Non-JSON response:", text.substring(0, 200));
      return {
        success: false,
        message: "Server returned an invalid response",
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Medication API
export const medicationApi = {
  getAll: (token: string) =>
    apiRequest("/medications", { token }),

  getToday: (token: string) =>
    apiRequest("/medications/today", { token }),

  getById: (id: string, token: string) =>
    apiRequest(`/medications/${id}`, { token }),

  create: (data: CreateMedicationData, token: string) =>
    apiRequest("/medications", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: UpdateMedicationData, token: string) =>
    apiRequest(`/medications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiRequest(`/medications/${id}`, {
      method: "DELETE",
      token,
    }),

  log: (id: string, status: "taken" | "skipped", token: string) =>
    apiRequest(`/medications/${id}/log`, {
      method: "POST",
      body: JSON.stringify({ status }),
      token,
    }),
};

// Types
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
  todayStatus?: "taken" | "skipped" | null;
  todayTakenAt?: string | null;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  date: string;
  status: "taken" | "skipped";
  takenAt: string | null;
  createdAt: string;
}
