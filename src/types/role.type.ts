export interface Role {
  id: number;
  title: string;
  user_count: number;
}

export interface CreateRolePayload {
  title: string;
}

export interface UpdateRolePayload {
  title?: string;
}
