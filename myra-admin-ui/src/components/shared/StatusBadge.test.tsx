import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/shared/StatusBadge";

describe("StatusBadge", () => {
  it("renders success, warning, error, and muted states", () => {
    render(
      <div>
        <StatusBadge status="ACTIVE" />
        <StatusBadge status="PENDING" />
        <StatusBadge status="FAILED" />
        <StatusBadge status="INACTIVE" />
      </div>
    );

    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("FAILED")).toBeInTheDocument();
    expect(screen.getByText("INACTIVE")).toBeInTheDocument();
  });
});
