export interface Interrogation {
  id: number;
  case: number;
  suspect: number;
  suspect_name: string;
  interrogator: number; // User ID
  interrogator_name: string;
  interrogator_role: "Detective" | "Sergeant";
  score: number | null; // Score given by interrogator (1-100 probably)
  captain_score: number | null; // Final score given by Captain
  captain_notes?: string;
  status: "pending_score" | "pending_review" | "completed" | "rejected";
  created_at: string;
  updated_at: string;
  notes: string;
}

export interface CreateInterrogationRequest {
  case: number;
  suspect: number;
  notes?: string;
}

export interface SubmitScoreRequest {
  score: number;
}

export interface ReviewInterrogationRequest {
  captain_score: number;
  notes?: string;
  is_approved?: boolean; // For critical crimes
}
