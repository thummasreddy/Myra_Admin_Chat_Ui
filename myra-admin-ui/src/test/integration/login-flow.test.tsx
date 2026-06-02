import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { useAuthStore } from "@/features/auth/auth.store";

vi.mock("@/features/auth/auth.api", () => ({
  login: vi.fn(async () => ({
    token: "jwt-token",
    user: {
      id: "admin-1",
      name: "Admin",
      email: "admin@myra.ai",
      role: "ADMIN"
    }
  }))
}));

function renderLoginFlow() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard ready</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("login flow", () => {
  it("stores the returned session and navigates to the dashboard", async () => {
    useAuthStore.getState().logout();
    renderLoginFlow();

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText("Dashboard ready")).toBeInTheDocument());
    expect(useAuthStore.getState().token).toBe("jwt-token");
  });
});
