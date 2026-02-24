export interface SuspectDetails {
  id: number;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  national_id: string;
  role: number;
  role_title: string;
}

export interface Suspect {
  id: number;
  suspect_details: SuspectDetails;
  crime_title?: string;
  crime_level?: string;
  status:
    | "suspect"
    | "wanted"
    | "most_wanted"
    | "arrested"
    | "convicted"
    | "innocent";
  case_details?: {
    id: number;
    crime_details: string;
  };
  case?: number;
  suspect?: number;
  added_by?: number;
  added_at?: string;
  wanted_since: string;
  priority_score: number;
  reward_amount: number;
}
