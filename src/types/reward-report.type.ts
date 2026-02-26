export type ReportStatus =
  | "pending_officer"
  | "rejected_by_officer"
  | "pending_detective"
  | "rejected_by_detective"
  | "approved";

export interface Report {
  id: number;
  description: string;
  status: ReportStatus;
  reporter: number;
  case: number | null;
  suspect: number | null;
  officer: number | null;
  detective: number | null;
  reward: number | null;
  created_at: string;
}

export interface ReportDetail extends Report {
  reporter_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    national_id: string;
    role_title: string;
  };
  officer_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role_title: string;
  } | null;
  detective_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role_title: string;
  } | null;
  case_details: {
    id: number;
    title: string;
    description?: string;
  } | null;
  suspect_details: {
    id: number;
    suspect: number;
    suspect_details?: {
      first_name?: string;
      last_name?: string;
    };
    crime_details?: {
      title: string;
      level: string;
    };
    status_display?: string;
  } | null;
  status_display: string;
}

export interface ReportCreateRequest {
  suspect?: number;
  case?: number;
  description: string;
}

export interface ReportReviewRequest {
  is_approved: boolean;
  rejection_reason?: string;
}
