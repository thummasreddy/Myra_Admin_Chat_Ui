export type LoginRequest = {
  email: string;
  password: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "MYRA_SUPER_ADMIN" | "MYRA_SUPPORT_ADMIN";
};

export type LoginResponse = {
  token: string;
  refreshToken?: string;
  user: AdminUser;
};
