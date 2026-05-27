import { apiClient, isBackendUnavailable } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse } from "@/features/auth/auth.types";

const fallbackUser = {
  id: "admin-demo",
  name: "Myra Admin",
  email: "admin@myra.ai",
  role: "OWNER" as const
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;

    return {
      token: `demo-token-${Date.now()}`,
      user: {
        ...fallbackUser,
        email: payload.email || fallbackUser.email
      }
    };
  }
}
