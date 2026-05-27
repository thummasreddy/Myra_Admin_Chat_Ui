import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/features/auth/auth.store";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function isBackendUnavailable(error: unknown) {
  if (!axios.isAxiosError(error)) return false;
  return !error.response || error.code === "ERR_NETWORK" || error.code === "ECONNABORTED";
}
