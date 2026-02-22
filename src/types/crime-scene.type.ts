export interface Witness {
  id: number;
  username?: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  national_id?: string;
}

export interface CrimeScene {
  id: number;
  location?: string;
  description?: string;
  seen_at: string;
  is_confirmed: boolean;
  viewer: number;
  examiner?: number;
  case_report?: number;
  witnesses: number[];
}

export interface CrimeSceneDetail {
  id: number;
  location?: string;
  description?: string;
  seen_at: string;
  is_confirmed: boolean;
  viewer: number;
  viewer_details: {
    id: number;
    username: string;
    role_title: string;
  };
  examiner?: number;
  examiner_details?: {
    id: number;
    username: string;
    role_title: string;
  };
  case_report?: number;
  witnesses: number[];
  witnesses_details: Witness[];
}

export interface CreateCrimeSceneRequest {
  viewer: number;
  location?: string;
  description?: string;
  seen_at: string;
  witness_ids: number[];
}
