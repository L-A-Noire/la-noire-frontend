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

export const deleteSuspectCrime = async (id: number): Promise<void> => {
  await http.delete(`/suspect/suspect-crimes/${id}/`);
};

export const getWantedSuspects = async (): Promise<Suspect[]> => {
  const response = await http.get<Suspect[]>("/suspect/wanted/");
  return response.data;
};

export const getSuspectCrimeBySuspectAndCase = async (
  suspectId: number,
  caseId: number
): Promise<SuspectCrime | null> => {
  try {
    // First get the case to get the crime ID
    const caseResponse = await http.get(`/crime/cases/${caseId}/`);
    const crimeId = caseResponse.data.crime;
    
    if (!crimeId) {
      console.error("Case has no associated crime");
      return null;
    }
    
    // Then get suspect-crimes filtered by suspect and crime
    const response = await http.get<SuspectCrime[]>(
      `/suspect/suspect-crimes/?suspect=${suspectId}&crime=${crimeId}`
    );
    
    return response.data[0] || null;
  } catch (error) {
    console.error("Error fetching suspect-crime:", error);
    return null;
  }
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

// // Add existing suspect to case (creates SuspectCrime)
export const addSuspectToCase = async (data: {
  suspect: number;
  case: number;
  status?: string;
}): Promise<Suspect> => {
  const response = await http.post<Suspect>("/suspect/suspect-crimes/", data);
  return response.data;
};

// // Mark suspect as wanted (sergeant action)
export const markAsWanted = async (suspectCrimeId: number): Promise<Suspect> => {
  const response = await http.post<Suspect>(`/suspect/suspect-crimes/${suspectCrimeId}/mark_as_wanted/`);
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

// Update suspect status
export const updateSuspectStatus = async (
  suspectId: number,
  status: string
): Promise<Suspect> => {
  const response = await http.patch<Suspect>(`/suspect/suspects/${suspectId}/`, {
    status,
  });
  return response.data;
};

export const getSuspectCrimeBySuspectAndCrime = async (
  suspectId: number,
  crimeId: number
): Promise<SuspectCrime | null> => {
  try {
    const response = await http.get<SuspectCrime[]>(
      `/suspect/suspect-crimes/?suspect=${suspectId}&crime=${crimeId}`
    );
    return response.data[0] || null;
  } catch (error) {
    console.error("Error fetching suspect-crime:", error);
    return null;
  }
};