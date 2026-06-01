import { apiClient, isBackendUnavailable } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse } from "@/features/auth/auth.types";

const fallbackUser = {
  id: "admin-demo",
  name: "Myra Admin",
  email: "admin@myra.ai",
  role: "ADMIN" as const
};

function fallbackRole(email?: string) {
  if (email?.includes("customer")) return "TENANT_OWNER" as const;
  if (email?.includes("support")) return "SUPPORT_ENGINEER" as const;
  if (email?.includes("billing")) return "BILLING_ADMIN" as const;
  return fallbackUser.role;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;

    const role = fallbackRole(payload.email);
    return {
      token: `demo-token-${Date.now()}`,
      user: {
        ...fallbackUser,
        email: payload.email || fallbackUser.email,
        name: role === "TENANT_OWNER" ? "Tenant Owner" : role === "SUPPORT_ENGINEER" ? "Support Engineer" : role === "BILLING_ADMIN" ? "Billing Admin" : fallbackUser.name,
        role
      }
    };
  }
}
