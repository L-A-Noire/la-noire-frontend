import http from "@/lib/http";
import type { Suspect, SuspectCrime } from "@/types/suspect.type";

export const getSuspectCrimes = async (): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>("/suspect/suspect-crimes/");
  return response.data;
};

export const getSuspectCrime = async (id: number): Promise<Suspect> => {
  const response = await http.get<Suspect>(`/suspect/suspect-crimes/${id}/`);
  return response.data;
};

export const getSuspectsByCaseDirect = async (
  caseId: number,
): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>(
    `/suspect/suspects/?suspected_crimes__crime__case__id=${caseId}`,
  );
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

export const deleteSuspectCrime = async (id: number): Promise<void> => {
  await http.delete(`/suspect/suspect-crimes/${id}/`);
};

export const getWantedSuspects = async (): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>(
    "/suspect/suspects/?status__in=wanted,most_wanted",
  );
  return response.data;
};

// Get all suspects (for detective dropdown)
export const getAllSuspects = async (): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>("/suspect/suspects/");
  return response.data;
};

// Get suspects for a specific case
export const getSuspectsByCase = async (caseId: number): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>(
    `/suspect/suspect-crimes/?case=${caseId}`,
  );
  return response.data;
};

// // Get suspect by ID
export const getSuspect = async (id: number): Promise<Suspect> => {
  const response = await http.get<Suspect>(`/suspect/suspects/${id}/`);
  return response.data;
};

// // Create a new suspect
export const createSuspect = async (data: FormData): Promise<Suspect> => {
  const response = await http.post<Suspect>("/suspect/suspects/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// // Update suspect status (for sergeant)
// export const updateSuspectStatus = async (
//   suspectCrimeId: number,
//   status: string,
// ): Promise<Suspect> => {
//   const response = await http.patch<Suspect>(`/suspect/suspect-crimes/${suspectCrimeId}/`, {
//     status,
//   });
//   return response.data;
// };

// // Add existing suspect to case (creates SuspectCrime)
export const addSuspectToCase = async (data: {
  suspect: number;
  case: number;
  status?: string;
}): Promise<Suspect> => {
  const response = await http.post<Suspect>("/suspect/suspect-crimes/", data);
  return response.data;
};

// Mark suspect as wanted (sergeant action)
// Note: Pass suspect id (from suspect.suspect or suspect.id when using Suspect type)
export const markAsWanted = async (suspectId: number): Promise<Suspect> => {
  const response = await http.post<Suspect>(
    `/suspect/suspects/${suspectId}/mark_as_wanted/`,
    {},
  );
  return response.data;
};

// Delete suspect from case
export const deleteSuspectFromCase = async (
  suspectCrimeId: number,
): Promise<void> => {
  await http.delete(`/suspect/suspect-crimes/${suspectCrimeId}/`);
};

// Update suspect status (works on SuspectCrime)
export const updateSuspectCrimeStatus = async (
  suspectCrimeId: number,
  status: string,
): Promise<SuspectCrime> => {
  const response = await http.patch<SuspectCrime>(
    `/suspect/suspect-crimes/${suspectCrimeId}/`,
    { status },
  );
  return response.data;
};

// Mark suspect as wanted (works on Suspect)
export const markSuspectAsWanted = async (
  suspectId: number,
): Promise<Suspect> => {
  const response = await http.post<Suspect>(
    `/suspect/suspects/${suspectId}/mark_as_wanted/`,
  );
  return response.data;
};
