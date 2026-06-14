import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "@/shared/theme/ThemeProvider";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";

function ThemeHarness() {
  const { theme } = useTheme();

  return (
    <div>
      <span>{theme}</span>
      <ThemeToggle />
    </div>
  );
}

describe("ThemeProvider", () => {
  it("defaults to dark on first visit", () => {
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    );

    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("loads and applies a saved light theme", () => {
    localStorage.setItem("myra-theme", "light");

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    );

    expect(screen.getByText("light")).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("persists switch changes", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    );

    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    expect(toggle).toHaveAttribute("aria-checked", "true");

    await user.click(toggle);

    expect(localStorage.getItem("myra-theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });
});
