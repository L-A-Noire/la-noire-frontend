// src/api/punishment.ts
import http from "@/lib/http";
import type {
  Punishment,
  CreatePunishmentPayload,
} from "@/types/punishment.type";

export const getPunishments = async (): Promise<Punishment[]> => {
  const response = await http.get<Punishment[]>("/suspect/punishments/");
  return response.data;
};

export const issuePunishment = async (
  suspectCrimeId: number,
  payload: CreatePunishmentPayload,
): Promise<Punishment> => {
  const response = await http.post<Punishment>(
    `/suspect/suspect-crimes/${suspectCrimeId}/issue-punishment/`,
    payload,
  );
  return response.data;
};

export const getPunishment = async (id: number): Promise<Punishment> => {
  const response = await http.get<Punishment>(`/suspect/punishments/${id}/`);
  return response.data;
};
