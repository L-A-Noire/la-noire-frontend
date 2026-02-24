import http from "@/lib/http";
import type { Suspect } from "@/types/suspect.type";

export const getSuspectCrimes = async (): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>("/suspect/suspect-crimes/");
  return response.data;
};
