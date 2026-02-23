import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../stores/auth.store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"; // Replace with your actual API URL

const http: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const extractErrorMessage = (error: any): string => {
  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === 'string') return data;

    if (typeof data === 'object') {
      if (data.non_field_errors) {
        return Array.isArray(data.non_field_errors) 
          ? data.non_field_errors[0] 
          : data.non_field_errors;
      }

      const fieldErrors: string[] = [];
      Object.entries(data).forEach(([field, errors]) => {
        if (Array.isArray(errors)) {
          fieldErrors.push(`${field}: ${errors.join(', ')}`);
        } else if (typeof errors === 'string') {
          fieldErrors.push(`${field}: ${errors}`);
        }
      });

      if (fieldErrors.length > 0) {
        return fieldErrors.join('\n');
      }

      if (data.detail) return data.detail;

      if (data.message) return data.message;
    }
  }
  return error.message || "Something went wrong";
};

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Extract error message
    const message = extractErrorMessage(error);

    // Display error toast
    toast.error(message);

    // Optional: Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      // Clear session and redirect to login if needed
      // useAuthStore.getState().clearSession();
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default http;