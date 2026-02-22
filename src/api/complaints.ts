import http from "@/lib/http";
import type {
  Complaint,
  ComplaintDetail,
  CreateComplaintRequest,
  ComplaintReviewRequest,
  ComplaintReviewResponse,
} from "@/types/complaint.type";

export const getComplaints = async (): Promise<ComplaintDetail[]> => {
  const response = await http.get<ComplaintDetail[]>("/crime/complaints/");
  console.log("Complaints API Response:", response.data);
  return response.data;
};

export const getComplaintById = async (
  id: number,
): Promise<ComplaintDetail> => {
  const response = await http.get<ComplaintDetail>(`/crime/complaints/${id}/`);
  return response.data;
};

export const createComplaint = async (
  data: CreateComplaintRequest,
): Promise<Complaint> => {
  const response = await http.post<Complaint>("/crime/complaints/", data);
  return response.data;
};

export const updateComplaint = async (
  id: number,
  data: Partial<CreateComplaintRequest>,
): Promise<Complaint> => {
  const response = await http.patch<Complaint>(
    `/crime/complaints/${id}/`,
    data,
  );
  return response.data;
};

export const deleteComplaint = async (id: number): Promise<void> => {
  await http.delete(`/crime/complaints/${id}/`);
};

export const reviewComplaintAsCadet = async (
  id: number,
  data: ComplaintReviewRequest,
): Promise<ComplaintReviewResponse> => {
  const response = await http.put<ComplaintReviewResponse>(
    `/crime/complaints/${id}/review-cadet/`,
    data,
  );
  return response.data;
};

export const reviewComplaintAsOfficer = async (
  id: number,
  data: ComplaintReviewRequest,
): Promise<ComplaintReviewResponse> => {
  const response = await http.put<ComplaintReviewResponse>(
    `/crime/complaints/${id}/review-officer/`,
    data,
  );
  return response.data;
};

export const createCaseFromComplaint = async (id: number): Promise<void> => {
  await http.post(`/crime/complaints/${id}/create-case/`, {});
};
