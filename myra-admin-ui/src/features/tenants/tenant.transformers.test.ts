import { describe, expect, it } from "vitest";
import {
  fromTenantListResponse,
  fromTenantResponse,
  normalizeResponseStyle,
  toTenantUpdateRequest
} from "@/features/tenants/tenant.transformers";

describe("tenant transformers", () => {
  it("maps snake_case backend tenant responses to camelCase UI tenants", () => {
    const tenant = fromTenantResponse({
      tenant_id: "tenant_1",
      api_key: "mk_live_1",
      tenant_name: "Acme",
      website_url: "https://example.com",
      support_email: "hello@example.com",
      assistant_name: "Myra",
      assistant_intro: "Hello",
      brand_color: "#2563EB",
      system_prompt: "Help customers",
      response_style: "PROFESSIONAL",
      allowed_topics: ["pricing"],
      suggested_prompts: ["What do you offer?"],
      enable_web_search: true,
      enable_lead_capture: true,
      enable_suggested_prompts: true,
      status: "ACTIVE",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z"
    });

    expect(tenant.tenantId).toBe("tenant_1");
    expect(tenant.tenantName).toBe("Acme");
    expect(tenant.brandColor).toBe("#2563EB");
    expect(tenant.responseStyle).toBe("PROFESSIONAL");
    expect(tenant.enableWebSearch).toBe(true);
  });

  it("normalizes legacy lowercase response styles", () => {
    expect(normalizeResponseStyle("friendly")).toBe("FRIENDLY");
    expect(normalizeResponseStyle("concise")).toBe("CONCISE");
    expect(normalizeResponseStyle("sales")).toBe("SALES");
  });

  it("maps camelCase updates to snake_case backend payloads", () => {
    const payload = toTenantUpdateRequest({
      tenantName: "Acme",
      brandColor: "#EA5455",
      responseStyle: "FRIENDLY",
      enableLeadCapture: true,
      enableStructuredExtraction: false
    });

    expect(payload).toEqual({
      tenant_name: "Acme",
      brand_color: "#EA5455",
      response_style: "FRIENDLY",
      enable_lead_capture: true,
      enable_structured_extraction: false
    });
  });

  it("maps list responses wrapped in data arrays", () => {
    const tenants = fromTenantListResponse({
      data: [
        {
          tenant_id: "tenant_1",
          tenant_name: "Acme",
          response_style: "SALES",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z"
        }
      ]
    });

    expect(tenants).toHaveLength(1);
    expect(tenants[0].responseStyle).toBe("SALES");
  });
});
