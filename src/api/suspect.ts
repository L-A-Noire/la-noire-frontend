import http from "@/lib/http";
import type { Suspect } from "@/types/suspect.type";

export const getSuspectCrimes = async (): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>("/suspect/suspect-crimes/");
  return response.data;
};

export const getSuspectCrime = async (id: number): Promise<Suspect> => {
  const response = await http.get<Suspect>(`/suspect/suspect-crimes/${id}/`);
  return response.data;
};

export const updateSuspectStatus = async (
  id: number,
  status: string,
): Promise<Suspect> => {
  const response = await http.patch<Suspect>(`/suspect/suspect-crimes/${id}/`, {
    status,
  });
  return response.data;
};
export const getWantedSuspects = async (): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>("/suspect/wanted/");
  return response.data;
};