import axios, { AxiosInstance } from 'axios';


const BASE_URL = 'https://458eb490ef3a.ngrok-free.app/v1';

export const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Token getter function - will be set by ClerkProvider integration
let getTokenFn: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

// Request interceptor - automatically attach auth token
client.interceptors.request.use(
  async (config) => {
    if (getTokenFn) {
      const token = await getTokenFn();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - Clerk will handle re-auth
      console.error('Unauthorized - token may be expired');
    }
    return Promise.reject(error);
  }
);
