import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AdminUser } from "@/features/auth/auth.types";

type AuthState = {
  token: string | null;
  user: AdminUser | null;
  selectedTenantId: string | null;
  setSession: (token: string, user: AdminUser) => void;
  setSelectedTenantId: (tenantId: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      selectedTenantId: null,
      setSession: (token, user) => set({ token, user }),
      setSelectedTenantId: (selectedTenantId) => set({ selectedTenantId }),
      logout: () => set({ token: null, user: null, selectedTenantId: null })
    }),
    {
      name: "myra-auth",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
