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

export const logout = async () => {
  // If your backend handles logout, call it here.
  // Otherwise, just clear the store (which is usually done in the component).
  const { data } = await http.post("/auth/logout");
  return data;
};
