import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../stores/auth.store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const http: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const refresh = useAuthStore.getState().session?.refresh;
  if (!refresh) throw new Error("No refresh token");

  const { data } = await axios.post<{ access: string }>(
    `${API_URL}/auth/login/refresh/`,
    { refresh },
  );

  const session = useAuthStore.getState().session;
  if (session) {
    useAuthStore.getState().setSession({ ...session, access: data.access });
  }

  return data.access;
};

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractErrorMessage = (error: any): string => {
  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === "string") return data;

    if (typeof data === "object") {
      if (data.non_field_errors) {
        return Array.isArray(data.non_field_errors)
          ? data.non_field_errors[0]
          : data.non_field_errors;
      }

      const fieldErrors: string[] = [];
      Object.entries(data).forEach(([field, errors]) => {
        if (Array.isArray(errors)) {
          fieldErrors.push(`${field}: ${errors.join(", ")}`);
        } else if (typeof errors === "string") {
          fieldErrors.push(`${field}: ${errors}`);
        }
      });

      if (fieldErrors.length > 0) {
        return fieldErrors.join("\n");
      }

      if (data.detail) return data.detail;

      if (data.message) return data.message;
    }
  }
  return error.message || "Something went wrong";
};

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login/refresh/" &&
      originalRequest.url !== "/auth/login/"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return http(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearSession();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = extractErrorMessage(error);
    toast.error(message);

    return Promise.reject(error);
  },
);

export default http;
