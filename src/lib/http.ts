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

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const message =
      (error.response?.data as { message?: string })?.message ||
      (error.response?.data as { non_field_errors?: string[] })
        ?.non_field_errors?.[0] ||
      error.message ||
      "Something went wrong";

    // Display error toast
    toast.error(message);

    // Optional: Handle 401 Unauthorized globally (e.g., redirect to login or refresh token)
    if (error.response?.status === 401) {
      // useAuthStore.getState().clearSession();
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default http;
