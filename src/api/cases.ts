import http from "@/lib/http";
import type {
  CaseDetail,
  CaseList,
  CreateCaseRequest,
  UpdateCaseRequest,
  PatchCaseRequest,
  AssignDetectiveRequest,
  CloseCaseRequest,
  CaseTimeline,
} from "@/types/case.type";

/**
 * Get all cases
 * GET /api/crime/cases/
 */
export const getCases = async (): Promise<CaseList[]> => {
  const response = await http.get<CaseList[]>("/crime/cases/");
  return response.data;
};

/**
 * Get a single case by ID
 * GET /api/crime/cases/{id}/
 */
export const getCaseById = async (id: number): Promise<CaseDetail> => {
  const response = await http.get<CaseDetail>(`/crime/cases/${id}/`);
  return response.data;
};

/**
 * Create a new case
 * POST /api/crime/cases/
 */
export const createCase = async (
  data: CreateCaseRequest,
): Promise<CaseDetail> => {
  const response = await http.post<CaseDetail>("/crime/cases/", data);
  return response.data;
};

/**
 * Update a case completely (PUT)
 * PUT /api/crime/cases/{id}/
 */
export const updateCase = async (
  id: number,
  data: UpdateCaseRequest,
): Promise<CaseDetail> => {
  const response = await http.put<CaseDetail>(`/crime/cases/${id}/`, data);
  return response.data;
};

/**
 * Partially update a case (PATCH)
 * PATCH /api/crime/cases/{id}/
 */
export const patchCase = async (
  id: number,
  data: PatchCaseRequest,
): Promise<CaseDetail> => {
  const response = await http.patch<CaseDetail>(`/crime/cases/${id}/`, data);
  return response.data;
};

/**
 * Delete a case
 * DELETE /api/crime/cases/{id}/
 */
export const deleteCase = async (id: number): Promise<void> => {
  await http.delete(`/crime/cases/${id}/`);
};

/**
 * Get case timeline (complaints, crime scenes, reports)
 * GET /api/crime/cases/{id}/timeline/
 */
export const getCaseTimeline = async (id: number): Promise<CaseTimeline> => {
  const response = await http.get<CaseTimeline>(`/crime/cases/${id}/timeline/`);
  return response.data;
};

/**
 * Assign a detective to a case
 * POST /api/crime/cases/{id}/assign_detective/
 */
export const assignDetective = async (
  id: number,
  data: AssignDetectiveRequest,
): Promise<CaseDetail> => {
  const response = await http.post<CaseDetail>(
    `/crime/cases/${id}/assign_detective/`,
    data,
  );
  return response.data;
};

/**
 * Close a case
 * POST /api/crime/cases/{id}/close_case/
 */
export const closeCase = async (id: number): Promise<CaseDetail> => {
  const response = await http.post<CaseDetail>(
    `/crime/cases/${id}/close_case/`,
    { is_closed: true } as CloseCaseRequest,
  );
  return response.data;
};
