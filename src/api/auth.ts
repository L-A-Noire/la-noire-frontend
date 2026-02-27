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
export const logout = async () => {
  return Promise.resolve();
};

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  national_id: string;
  role_id: number;
  role_title: string;
  is_active: boolean;
  date_joined: string;
}

export const getUsers = async (): Promise<AdminUser[]> => {
  const { data } = await http.get<AdminUser[]>("/auth/users/");
  return data;
};

export interface ChangeRolePayload {
  user_id: number;
  role_id: number;
}

export const changeUserRole = async (
  payload: ChangeRolePayload,
): Promise<ChangeRolePayload> => {
  const { data } = await http.post<ChangeRolePayload>(
    "/auth/users/change-role/",
    payload,
  );
  return data;
};
