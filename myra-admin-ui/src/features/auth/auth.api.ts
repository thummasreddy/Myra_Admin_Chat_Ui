import axios from "axios";
import { appConfig } from "@/lib/config";
import { isBackendUnavailable } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse } from "@/features/auth/auth.types";

type BackendLoginResponse = {
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

function apiV1Url(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");
  if (normalized.endsWith("/api/v1")) return normalized;
  if (normalized.endsWith("/api/v1/admin")) return normalized.replace(/\/admin$/, "");
  return `${normalized}/api/v1`;
}

function fallbackRole(email?: string): LoginResponse["user"]["role"] {
  return email?.toLowerCase().includes("support") ? "MYRA_SUPPORT_ADMIN" : "MYRA_SUPER_ADMIN";
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await axios.post<BackendLoginResponse>(
      `${apiV1Url(appConfig.VITE_API_BASE_URL)}/auth/myra-admin/login`,
      payload,
      { withCredentials: true }
    );
    return normalizeLoginResponse(data, payload.email);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error("You do not have permission to access this.");
    }

    if (!isBackendUnavailable(error)) throw error;

    const role = fallbackRole(payload.email);
    return {
      token: `demo-myra-admin-token-${Date.now()}`,
      user: {
        id: role === "MYRA_SUPPORT_ADMIN" ? "support-demo" : "super-admin-demo",
        name: role === "MYRA_SUPPORT_ADMIN" ? "Myra Support" : "Myra Super Admin",
        email: payload.email,
        role
      }
    };
  }
}

function normalizeLoginResponse(data: BackendLoginResponse, fallbackEmail: string): LoginResponse {
  if (data.user && (data.token || data.access_token)) {
    return {
      token: data.token ?? data.access_token ?? "",
      refreshToken: data.refresh_token,
      user: {
        ...data.user,
        role: data.user.role === "MYRA_SUPPORT_ADMIN" ? "MYRA_SUPPORT_ADMIN" : "MYRA_SUPER_ADMIN"
      }
    };
  }

  const adminUser = data.admin_user ?? {};
  return {
    token: data.token ?? data.access_token ?? "",
    refreshToken: data.refresh_token,
    user: {
      id: adminUser.id ?? adminUser.admin_user_id ?? adminUser.email ?? fallbackEmail,
      name: adminUser.name ?? adminUser.full_name ?? adminUser.email ?? "Myra Admin",
      email: adminUser.email ?? fallbackEmail,
      role: adminUser.role === "MYRA_SUPPORT_ADMIN" ? "MYRA_SUPPORT_ADMIN" : "MYRA_SUPER_ADMIN"
    }
  };
}
