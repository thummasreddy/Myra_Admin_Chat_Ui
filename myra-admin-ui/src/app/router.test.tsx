import { describe, expect, it } from "vitest";
import { router } from "@/app/router";

describe("app router", () => {
  it("exposes the requested public routes", () => {
    const paths = router.routes.map((route) => route.path);

    expect(paths).toEqual(expect.arrayContaining(["/", "/pricing", "/register", "/login", "/myra-admin/login"]));
  });

  it("keeps the protected admin route set unchanged", () => {
    const protectedRoute = router.routes.find((route) => route.children?.some((child) => child.path === "dashboard"));

    expect(protectedRoute?.children?.map((route) => route.path)).toEqual([
      "dashboard",
      "approvals",
      "tenant-review",
      "payments",
      "knowledge-documents",
      "subscriptions",
      "email-notifications",
      "tenants",
      "tenants/:tenantId",
      "knowledge",
      "conversations",
      "leads",
      "analytics",
      "settings"
    ]);
  });
});
