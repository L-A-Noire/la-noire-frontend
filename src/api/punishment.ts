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

export const deletePunishment = async (id: number): Promise<void> => {
  await http.delete(`/suspect/punishments/${id}/`);
};

export const getPunishmentBySuspectCrime = async (suspectCrimeId: number): Promise<Punishment | null> => {
  try {
    const response = await http.get<Punishment[]>(`/suspect/punishments/?suspect_crime=${suspectCrimeId}`);
    return response.data[0] || null;
  } catch {
    return null;
  }
};