export interface Role {
    id: number;
    title: string;
    description?: string;
}

export interface CreateRolePayload {
    title: string;
    description?: string;
}

export interface UpdateRolePayload {
    title?: string;
    description?: string;
}
