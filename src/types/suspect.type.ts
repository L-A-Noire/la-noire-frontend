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
  suspect_details?: Suspect;
  crime: number;
  crime_details?: {
    id: number;
    title: string;
    level: string;
    description?: string;
    location?: string;
    committed_at?: string;
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
  
  status?: string;
}