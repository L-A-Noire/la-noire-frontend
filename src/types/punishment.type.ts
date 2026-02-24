// src/types/punishment.type.ts

export const PunishmentType = {
  FINE: "fine",
  BAIL: "bail",
  IMPRISONMENT: "imprisonment",
  DEATH: "death",
} as const;

export type PunishmentType =
  (typeof PunishmentType)[keyof typeof PunishmentType];

export interface Punishment {
  id: number;
  punishment_type_display: string;
  punishment_type: PunishmentType;
  title: string;
  description: string;
  amount: string | null;
  duration_months: number | null;
  is_paid: boolean;
  paid_at: string | null;
  payment_reference: string | null;
  issued_at: string;
  suspect_crime: number;
  case: number;
  issued_by: number;
  suspect_crime_details: string;
  case_details: unknown; // Ideally define this properly if needed
  issued_by_details: unknown; // Assuming User details
}

export interface CreatePunishmentPayload {
  suspect_crime: number;
  case: number;
  punishment_type: PunishmentType;
  title: string;
  description: string;
  amount?: string | null;
  duration_months?: number | null;
}
