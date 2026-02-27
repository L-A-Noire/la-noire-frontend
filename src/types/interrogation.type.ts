export interface Interrogation {
  id: number;
  suspect_crime: number;
  suspect_crime_details?: {
    id: number;
    suspect: number;
    suspect_details?: {
      id: number;
      name: string;
      nickname: string;
      national_id: number | null;
      status: string;
    };
    crime: number;
    crime_details?: {
      id: number;
      title: string;
      level: string;
    };
    status: string;
  };
  case: number;
  case_details?: {
    id: number;
    crime_title?: string;
    crime_details?: {
      level: string;
    };
  };
  interrogators: number[];
  interrogators_details?: Array<{
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role_title: string;
  }>;
  date: string;
  location: string;
  notes: string;
  detective_score: number | null;
  sergeant_score: number | null;
  final_score: number | null;
  reviewed_by: number | null;
  reviewed_by_details?: {
    id: number;
    username: string;
    role_title: string;
  };
  review_notes: string | null;
  status?: "pending_scores" | "pending_review" | "completed" | "rejected";
}

export interface CreateInterrogationRequest {
  suspect_crime: number;
  case: number;
  location: string;
  notes: string;
}

export interface SubmitScoreRequest {
  score: number;
}

export interface ReviewInterrogationRequest {
  score: number;
  notes?: string;
  is_approved: boolean;
}
