import http from "@/lib/http";
import type {
  SessionData,
  User,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth.type";

export const login = async (credentials: LoginPayload) => {
  const { data } = await http.post<SessionData>("/auth/login/", credentials);
  return data;
};

export const register = async (userData: RegisterPayload) => {
  const { data } = await http.post<SessionData>("/auth/register/", userData);
  return data;
};

export const getUserProfile = async () => {
  const { data } = await http.get<User>("/auth/profile/");
  return data;
};

/**
 * Logout: blacklist refresh token via POST /api/auth/logout/
 * Requires rest_framework_simplejwt.token_blacklist.
 */
export const logout = async (refresh: string) => {
  const { data } = await http.post("/auth/logout/", { refresh });
  return data;
};
