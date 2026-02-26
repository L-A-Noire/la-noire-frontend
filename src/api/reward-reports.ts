import http from "@/lib/http";
import type {
  Report,
  ReportDetail,
  ReportCreateRequest,
  ReportReviewRequest,
} from "@/types/reward-report.type";

export const createReport = async (
  data: ReportCreateRequest,
): Promise<Report> => {
  const response = await http.post<Report>("/reward/reports/", data);
  return response.data;
};

export const getReports = async (): Promise<Report[]> => {
  const response = await http.get<Report[]>("/reward/reports/");
  return response.data;
};

export const getReportById = async (id: number): Promise<ReportDetail> => {
  const response = await http.get<ReportDetail>(`/reward/reports/${id}/`);
  return response.data;
};

export const reviewReportAsOfficer = async (
  id: number,
  data: ReportReviewRequest,
): Promise<Report> => {
  const response = await http.put<Report>(
    `/reward/reports/${id}/review-officer/`,
    data,
  );
  return response.data;
};

export const reviewReportAsDetective = async (
  id: number,
  data: ReportReviewRequest,
): Promise<Report> => {
  const response = await http.put<Report>(
    `/reward/reports/${id}/review-detective/`,
    data,
  );
  return response.data;
};
