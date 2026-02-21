import http from "@/lib/http";
import type { Suspect } from "@/types/suspect.type";

export const getWantedSuspects = async (): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>("/suspect/wanted/");
  return response.data;
};
