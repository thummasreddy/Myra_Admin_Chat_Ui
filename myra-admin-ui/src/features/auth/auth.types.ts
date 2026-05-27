export type LoginRequest = {
  email: string;
  password: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN";
};

export type LoginResponse = {
  token: string;
  user: AdminUser;
};
