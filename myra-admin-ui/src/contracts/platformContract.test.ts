import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { RESPONSE_STYLES } from "@/lib/constants";
import { normalizeResponseStyle, toTenantUpdateRequest } from "@/features/tenants/tenant.transformers";

vi.mock("@/api/httpClient", () => ({
  leadHttp: {
    post: vi.fn(async () => ({
      data: { ok: true, message: "Lead captured" }
    }))
  }
}));

import { leadHttp } from "@/api/httpClient";
import { submitTestLead } from "@/api/leadApi";

type PlatformContract = {
  gateway: {
    routes: Record<string, { service: string }>;
  };
  canonicalFields: {
    chatResponse: {
      replyPath: string[];
    };
    leadRequest: {
      required: string[];
      defaults: {
        lead_type: string;
      };
      forbidden: string[];
    };
    tenantConfig: {
      adminMappings: Record<string, string>;
    };
    responseStyles: string[];
  };
};

function loadContract(): PlatformContract {
  return JSON.parse(readFileSync(path.resolve(process.cwd(), "../contracts/myra-platform.contract.json"), "utf8"));
}

describe("platform contract", () => {
  const contract = loadContract();

  it("documents gateway routing owned by the backend gateway", () => {
    expect(contract.gateway.routes["/api/v1/tenants/*"].service).toBe("tenant-service");
    expect(contract.gateway.routes["/api/v1/chat/*"].service).toBe("chat-service");
    expect(contract.gateway.routes["/api/v1/knowledge/*"].service).toBe("knowledge-service");
    expect(contract.gateway.routes["/api/v1/leads/*"].service).toBe("lead-service");
    expect(contract.gateway.routes["/api/v1/analytics/*"].service).toBe("analytics-service");
  });

  it("keeps admin response-style options aligned to the shared contract", () => {
    expect(RESPONSE_STYLES).toEqual(contract.canonicalFields.responseStyles);
    expect(normalizeResponseStyle("casual")).toBe("CASUAL");
    expect(normalizeResponseStyle("formal")).toBe("FORMAL");
  });

  it("maps tenant UI fields to backend snake_case contract fields", () => {
    const payload = toTenantUpdateRequest({
      tenantName: "Acme",
      brandColor: "#EA5455",
      responseStyle: "CASUAL",
      enableLeadCapture: true,
      suggestedPrompts: ["What services do you offer?"]
    });

    expect(payload).toMatchObject({
      tenant_name: "Acme",
      brand_color: "#EA5455",
      response_style: "CASUAL",
      enable_lead_capture: true,
      suggested_prompts: ["What services do you offer?"]
    });
    expect(payload).not.toHaveProperty("tenantName");
    expect(payload).not.toHaveProperty("brandColor");
    expect(contract.canonicalFields.tenantConfig.adminMappings.tenantName).toBe("tenant_name");
    expect(contract.canonicalFields.chatResponse.replyPath).toEqual(["data", "reply"]);
  });

  it("submits admin test leads with canonical phone/message fields and lead type", async () => {
    await submitTestLead({
      tenant_id: "tenant_contract",
      session_id: "admin_test_tenant_contract",
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+1 555 123 4567",
      message: "Please contact me about pricing.",
      source_url: "https://admin.example.com",
      metadata: { source: "contract_test" }
    });

    const [, payload] = vi.mocked(leadHttp.post).mock.calls.at(-1) ?? [];
    expect(payload).toMatchObject({
      phone: "+1 555 123 4567",
      message: "Please contact me about pricing.",
      lead_type: contract.canonicalFields.leadRequest.defaults.lead_type
    });
    expect(payload).not.toHaveProperty("mobile");
    expect(payload).not.toHaveProperty("interest");
    for (const field of contract.canonicalFields.leadRequest.required) {
      expect(payload).toHaveProperty(field);
    }
  });
});
