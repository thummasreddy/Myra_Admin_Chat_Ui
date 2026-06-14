import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LandingPage } from "@/features/public/pages/LandingPage";
import { RegisterPage } from "@/features/public/pages/RegisterPage";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";

describe("public pages", () => {
  it("renders the landing page and its primary public navigation", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <LandingPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: "AI Website Assistant for Businesses" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Register" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Login" }).length).toBeGreaterThan(0);

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(
      Array.from(navigation.children).map((item) => item.getAttribute("aria-label") ?? item.textContent?.trim())
    ).toEqual(["Pricing", "Login", "Register", "Dark mode"]);
  });

  it("keeps registration minimal and preselects a requested plan", () => {
    render(
      <MemoryRouter initialEntries={["/register?plan=Pro"]}>
        <ThemeProvider>
          <RegisterPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText("Business Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Owner Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Pro")).toBeChecked();
    expect(screen.queryByLabelText("Website URL")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Phone Number")).not.toBeInTheDocument();
  });
});
