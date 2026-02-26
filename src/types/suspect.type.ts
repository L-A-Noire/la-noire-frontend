export interface Suspect {
  id: number;
  name: string;
  nickname: string;
  description: string;
  gender: "m" | "f" | null;
  picture: string | null;
  national_id: number | null;
  created_at: string;
  status:
    | "suspected"
    | "wanted"
    | "most_wanted"
    | "arrested"
    | "convicted"
    | "innocent";
  wanted_since: string | null;
  priority_score: number;
  reward_amount: number;
  user?: number;
  user_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    national_id: string;
    role_title: string;
  };
}

export interface SuspectCrime {
  id: number;
  suspect: number;
  suspect_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    national_id: string;
    role_title: string;
  };
  crime: number | null;
  crime_details?: {
    id: number;
    title: string;
    level: string;
    description?: string;
    location?: string;
    committed_at?: string;
  };
  case?: number | null;
  case_details?: {
    id: number;
    title: string;
    description?: string;
    status?: string;
  };
  added_at: string;
  added_by: number;
  added_by_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role_title: string;
  };
  status: string;
  status_display?: string;
}
