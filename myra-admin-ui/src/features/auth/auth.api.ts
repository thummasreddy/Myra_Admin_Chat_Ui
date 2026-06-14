import axios from "axios";
import { appConfig } from "@/lib/config";
import { isBackendUnavailable } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse } from "@/features/auth/auth.types";

type BackendLoginResponse = {
  success?: boolean;
  data?: {
    token?: string;
    access_token?: string;
    refresh_token?: string;
    user?: {
      id?: string;
      email?: string;
      full_name?: string;
      role?: string;
      user_type?: string;
      is_active?: boolean;
      status?: string;
    };
  };
  token?: string;
  access_token?: string;
  refresh_token?: string;
  admin_user?: {
    id?: string;
    admin_user_id?: string;
    email?: string;
    full_name?: string;
    name?: string;
    role?: LoginResponse["user"]["role"];
  };
  user?: LoginResponse["user"];
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const baseUrl = appConfig.VITE_API_BASE_URL.replace(/\/+$/, "");
    const { data } = await axios.post<BackendLoginResponse>(
      `${baseUrl}/auth/myra-admin/login`,
      payload,
      { withCredentials: true }
    );
    return normalizeLoginResponse(data, payload.email);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error("You do not have permission to access this.");
    }

    if (!isBackendUnavailable(error)) throw error;

    throw new Error("Backend is unavailable. Please check your connection and try again.");
  }
}

function normalizeLoginResponse(raw: BackendLoginResponse, fallbackEmail: string): LoginResponse {
  // Handle wrapped response { success, data: { access_token, user } }
  const data = raw.success && raw.data ? raw.data : raw;

  const token = (data as { access_token?: string; token?: string }).access_token
    ?? (data as { token?: string }).token ?? "";
  const refreshToken = (data as { refresh_token?: string }).refresh_token;

  const user = (data as { user?: BackendLoginResponse["data"] extends { user?: infer U } ? U : never }).user
    ?? (raw as { admin_user?: BackendLoginResponse["admin_user"] }).admin_user;

  if (user) {
    const role = (user.role === "MYRA_SUPPORT_ADMIN" ? "MYRA_SUPPORT_ADMIN" : "MYRA_SUPER_ADMIN") as LoginResponse["user"]["role"];
    return {
      token,
      refreshToken,
      user: {
        id: user.id ?? user.email ?? fallbackEmail,
        name: ("full_name" in user ? user.full_name : undefined) ?? ("name" in user ? (user as { name?: string }).name : undefined) ?? fallbackEmail,
        email: user.email ?? fallbackEmail,
        role
      }
    };
  }

  return {
    token,
    refreshToken,
    user: {
      id: fallbackEmail,
      name: "Myra Admin",
      email: fallbackEmail,
      role: "MYRA_SUPER_ADMIN"
    }
  };
}
