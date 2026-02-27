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
  issued_by: number;
  suspect_crime_details?: unknown;
  issued_by_details?: unknown;
}

export interface CreatePunishmentPayload {
  suspect_crime: number;
  punishment_type: PunishmentType;
  title: string;
  description: string;
  amount?: string | null;
  duration_months?: number | null;
}
