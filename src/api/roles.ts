import http from "@/lib/http";
import { CreateRolePayload, Role, UpdateRolePayload } from "@/types/role.type";

export const getRoles = async (): Promise<Role[]> => {
    const response = await http.get<Role[]>('/auth/roles/');
    return response.data;
};

export const createRole = async (payload: CreateRolePayload): Promise<Role> => {
    const response = await http.post<Role>('/auth/roles/', payload);
    return response.data;
};

export const getRole = async (id: number): Promise<Role> => {
    const response = await http.get<Role>(`/auth/roles/${id}/`);
    return response.data;
};

export const updateRole = async (id: number, payload: UpdateRolePayload): Promise<Role> => {
    const response = await http.patch<Role>(`/auth/roles/${id}/`, payload);
    return response.data;
};

export const deleteRole = async (id: number): Promise<void> => {
    await http.delete(`/auth/roles/${id}/`);
};
