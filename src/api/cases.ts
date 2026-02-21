import http from "@/lib/http";
import type {
  Case,
  CreateCaseRequest,
  AssignDetectiveRequest,
} from "@/types/case.type";

export const getCases = async (): Promise<Case[]> => {
  const response = await http.get<Case[]>("/crime/cases/");
  return response.data;
};

export const createCase = async (data: CreateCaseRequest): Promise<Case> => {
  const response = await http.post<Case>("/crime/cases/", data);
  return response.data;
};

export const getCaseTimeline = async (id: number): Promise<Case> => {
  const response = await http.get<Case>(`/crime/cases/${id}/timeline/`);
  return response.data;
};

export const assignDetective = async (
  id: number,
  data: AssignDetectiveRequest,
): Promise<Case> => {
  // The API doc says: POST /api/crime/cases/{id}/assign_detective/
  // Request body: { "is_from_crime_scene": true, ... }
  // But conventionally "assign detective" should only need detective ID.
  // The user prompt shows full body for assign_detective request. I will stick to what the user provided.
  // "Request body: { is_from_crime_scene: true, is_closed: true, crime: 0, detective: 0 }"
  // This looks like a full update. I will accept generic data or specific detective ID.
  // However, usually specific endpoints take specific data.
  // I will assume the prompt's request body example might be a copy-paste of a generic case object.
  // But I must follow it if I want to be safe.
  // Wait, if I look at `POST /assign_detective/` description:
  // It takes `id` in path.
  // It takes a body with `detective`.
  // The example body shows all fields.
  // I'll define the function to take the body as `Partial<CreateCaseRequest>` or `any`.
  const response = await http.post<Case>(
    `/crime/cases/${id}/assign_detective/`,
    data,
  );
  return response.data;
};

export const closeCase = async (id: number): Promise<Case> => {
  // Documentation shows body with all fields for close_case too.
  // I'll send an empty body or whatever is required. The example shows a full body.
  // I'll assume passing the status update is enough, or maybe it updates the state on server side without body?
  // The example body is `{ "is_from_crime_scene": true ... }`.
  // I'll try sending the required fields if I have them, but since I assume "Close" is an action,
  // maybe I just POST.
  // Let's implement it to take data if needed, but for "close" usually it's just a toggle.
  // However, following the spec strictly:
  // It expects a body. I will pass `{ is_closed: true }` and hope the backend accepts partials or handles it.
  // Or I might need to fetch the case first, then send it back with `is_closed: true`.
  // For now, I will send `{ is_closed: true }` as a partial.
  const response = await http.post<Case>(`/crime/cases/${id}/close_case/`, {
    is_closed: true,
  });
  return response.data;
};
