export type LoginRequest = {
  email: string;
  password: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPPORT_ENGINEER" | "BILLING_ADMIN" | "TENANT_OWNER";
};

export type LoginResponse = {
  token: string;
  user: AdminUser;
};
