// import http from "@/lib/http";
// import type {
//   Interrogation,
//   CreateInterrogationRequest,
//   SubmitScoreRequest,
//   ReviewInterrogationRequest,
// } from "@/types/interrogation.type";

// /**
//  * Get interrogations for a specific case
//  */
// export const getCaseInterrogations = async (
//   caseId: number,
// ): Promise<Interrogation[]> => {
//   // Assuming the API supports filtering by case_id
//   const response = await http.get<Interrogation[]>(
//     `/suspect/interrogations/?case=${caseId}`,
//   );
//   return response.data;
// };

// /**
//  * Create a new interrogation (Start interrogation)
//  * Detective or Sergeant actions
//  */
// export const createInterrogation = async (
//   data: CreateInterrogationRequest,
// ): Promise<Interrogation> => {
//   const response = await http.post<Interrogation>(
//     "/suspect/interrogations/",
//     data,
//   );
//   return response.data;
// };

// /**
//  * Submit score for an interrogation
//  * Detective or Sergeant actions
//  */
// export const submitInterrogationScore = async (
//   id: number,
//   data: SubmitScoreRequest,
// ): Promise<Interrogation> => {
//   const response = await http.patch<Interrogation>(
//     `/suspect/interrogations/${id}/submit-score/`,
//     data,
//   );
//   return response.data;
// };

// /**
//  * Review interrogation by Captain
//  */
// export const reviewInterrogation = async (
//   id: number,
//   data: ReviewInterrogationRequest,
// ): Promise<Interrogation> => {
//   const response = await http.patch<Interrogation>(
//     `/suspect/interrogations/${id}/review/`,
//     data,
//   );
//   return response.data;
// };


// src/api/interrogations.ts
import http from "@/lib/http";
import type { 
  Interrogation, 
  CreateInterrogationRequest,
  SubmitScoreRequest,
  ReviewInterrogationRequest 
} from "@/types/interrogation.type";

// Get interrogations for a case
export const getCaseInterrogations = async (caseId: number): Promise<Interrogation[]> => {
  const response = await http.get<Interrogation[]>(`/suspect/interrogations/?case=${caseId}`);
  return response.data;
};

// Get a single interrogation
export const getInterrogation = async (id: number): Promise<Interrogation> => {
  const response = await http.get<Interrogation>(`/suspect/interrogations/${id}/`);
  return response.data;
};

// Create a new interrogation
export const createInterrogation = async (data: CreateInterrogationRequest): Promise<Interrogation> => {
  const response = await http.post<Interrogation>("/suspect/interrogations/", data);
  return response.data;
};

// Submit score (for detective or sergeant)
export const submitInterrogationScore = async (
  id: number,
  data: SubmitScoreRequest
): Promise<Interrogation> => {
  const response = await http.patch<Interrogation>(`/suspect/interrogations/${id}/submit_score/`, data);
  return response.data;
};

// Review interrogation (for captain)
export const reviewInterrogation = async (
  id: number,
  data: ReviewInterrogationRequest
): Promise<Interrogation> => {
  const response = await http.patch<Interrogation>(`/suspect/interrogations/${id}/review/`, data);
  return response.data;
};
