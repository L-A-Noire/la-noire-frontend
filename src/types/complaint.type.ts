export type ComplaintStatus = 
  | "pending_cadet"
  | "rejected_by_cadet"
  | "pending_officer"
  | "rejected_by_officer"
  | "approved"
  | "invalid";

export interface Complainant {
  id: number;
  username?: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  national_id?: string;
}

export interface Complaint {
  id: number;
  description: string;
  created_at: string;
  status: ComplaintStatus;
  rejection_count: number;
  cadet_rejection_reason?: string;
  officer_rejection_reason?: string;
  complainants: number[];
  cadet: number;
  police_officer: number;
  case?: number;
}

export interface ComplaintDetail {
  id: number;
  description: string;
  created_at: string;
  status: ComplaintStatus;
  status_display: string;
  rejection_count: number;
  cadet_rejection_reason?: string;
  officer_rejection_reason?: string;
  complainants: number[];
  complainants_details: Complainant[];
  cadet: number;
  cadet_details: {
    id: number;
    username: string;
    role_title: string;
  };
  police_officer: number;
  officer_details: {
    id: number;
    username: string;
    role_title: string;
  };
  case?: number;
}

export interface CreateComplaintRequest {
  description: string;
  complainant_ids: number[];
}

export interface ComplaintReviewRequest {
  is_confirmed: boolean;
  rejection_reason?: string;
}

export interface ComplaintReviewResponse {
  is_confirmed: boolean;
  rejection_reason?: string;
}
