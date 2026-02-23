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

export const ALLOWED_CASE_ROLES = [
  "Administrator",
  "Chief",
  "Captain",
  "Sergent",
  "Detective",
  "Police/Patrol Officer",
  "Cadet",
  "Judge",
  "Coronary",
] as const;

export type AllowedCaseRole = (typeof ALLOWED_CASE_ROLES)[number];
