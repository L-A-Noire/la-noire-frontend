export type EvidenceType =
  | "witness_testimony"
  | "forensic"
  | "vehicle"
  | "identification"
  | "other";

export type ForensicSubType =
  | "blood"
  | "hair"
  | "fingerprint"
  | "dna"
  | "fibers"
  | "toxicology";

export type VehicleInfoType = "plate" | "serial";

// Base Evidence Interface
export interface Evidence {
  id: number;
  case: number;
  title: string;
  description: string;
  recorded_at: string;
  recorded_by: number;
  evidence_type: EvidenceType;
  created_at: string;
}

// Witness Testimony Evidence
export interface WitnessTestimonyEvidence extends Evidence {
  evidence_type: "witness_testimony";
  witness_name?: string;
  witness_contact?: string;
  statement: string;
  media_urls?: string[]; // Images, videos, audio files
}

// Forensic Evidence
export interface ForensicEvidence extends Evidence {
  evidence_type: "forensic";
  forensic_type: ForensicSubType;
  collection_location?: string;
  tested_by?: number;
  test_result?: string;
  test_status: "pending" | "in_progress" | "completed" | "error";
  media_urls?: string[];
}

// Vehicle Evidence
export interface VehicleEvidence extends Evidence {
  evidence_type: "vehicle";
  vehicle_model?: string;
  vehicle_color?: string;
  plate_number?: string;
  serial_number?: string;
  info_type: VehicleInfoType;
  media_urls?: string[];
}

// Identification Evidence
export interface IdentificationEvidence extends Evidence {
  evidence_type: "identification";
  discovered_person_name?: string;
  person_details: Record<string, string>; // Key-value pairs for flexible storage
  media_urls?: string[];
}

// Other Evidence (Generic)
export interface OtherEvidence extends Evidence {
  evidence_type: "other";
  custom_properties?: Record<string, string | number | boolean>;
  media_urls?: string[];
}

// Union type for all evidence
export type EvidenceDetail =
  | WitnessTestimonyEvidence
  | ForensicEvidence
  | VehicleEvidence
  | IdentificationEvidence
  | OtherEvidence;

// Create Request
export interface CreateEvidenceRequest {
  case: number;
  title: string;
  description: string;
  evidence_type: EvidenceType;
  recorded_at: string;

  // Witness testimony fields
  witness_name?: string;
  witness_contact?: string;
  statement?: string;
  media_files?: File[];

  // Forensic fields
  forensic_type?: ForensicSubType;
  collection_location?: string;
  test_status?: "pending" | "in_progress" | "completed" | "error";

  // Vehicle fields
  vehicle_model?: string;
  vehicle_color?: string;
  plate_number?: string;
  serial_number?: string;
  info_type?: VehicleInfoType;

  // Identification fields
  discovered_person_name?: string;
  person_details?: Record<string, string>;

  // Other fields
  custom_properties?: Record<string, string | number | boolean>;
}

// List response with pagination
export interface EvidenceListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Evidence[];
}

// Evidence Summary for dashboard
export interface EvidenceSummary {
  total_count: number;
  by_type: Record<EvidenceType, number>;
  pending_tests: number;
  recent_evidence: Evidence[];
}
