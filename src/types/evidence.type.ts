// Image type
export interface Image {
  id: number;
  image: string;
  uploaded_by: number;
  uploaded_at?: string;
}

export interface ImageRequest {
  image: File;
  uploaded_by: number;
}

// Attachment type
export interface Attachment {
  id: number;
  file: string;
  provided_by: number;
  uploaded_at?: string;
}

export interface AttachmentRequest {
  file: File;
  provided_by: number;
}

// Base Evidence type
export interface BaseEvidence {
  id: number;
  title: string;
  description: string;
  seen_at: string;
  created_at: string;
  created_by: number;
  created_by_name?: string;
  case: number | null;
  location: string;
}

// Testimony Evidence
export interface Testimony extends BaseEvidence {
  transcription: string;
  attachments: number[];
  is_confirmed: boolean;
}

export interface TestimonyDetail extends Testimony {
  attachment_details?: Attachment[];
}

export interface CreateTestimonyRequest {
  title: string;
  description: string;
  transcription: string;
  attachments: number[];
  seen_at: string;
  created_by: number;
  case: number | null;
  location: string;
}

export interface ConfirmTestimonyRequest {
  crime_level: number;
}

// Biological Evidence
export interface BiologicalEvidence extends BaseEvidence {
  images: number[];
  result?: string | null;
  coronary?: number | null;
}

export interface BiologicalEvidenceDetail extends BiologicalEvidence {
  image_details?: Image[];
}

export interface CreateBiologicalEvidenceRequest {
  title: string;
  description: string;
  images: number[];
  result?: string | null;
  coronary?: number | null;
  seen_at: string;
  created_by: number;
  case: number;
  location: string;
}

// Vehicle Evidence
export interface VehicleEvidence extends BaseEvidence {
  vehicle_model: string;
  color: string;
  registration_plate_number?: string | null;
  serial_number?: string | null;
}

export interface VehicleEvidenceDetail extends VehicleEvidence {}

export interface CreateVehicleEvidenceRequest {
  title: string;
  description: string;
  vehicle_model: string;
  color: string;
  registration_plate_number?: string | null;
  serial_number?: string | null;
  seen_at: string;
  created_by: number;
  case: number;
  location: string;
}

// Identification Evidence
export interface IdentificationEvidence extends BaseEvidence {
  owner_first_name: string;
  owner_last_name: string;
  information?: Record<string, any>;
}

export interface IdentificationEvidenceDetail extends IdentificationEvidence {}

export interface CreateIdentificationEvidenceRequest {
  title: string;
  description: string;
  owner_first_name: string;
  owner_last_name: string;
  information?: Record<string, any>;
  seen_at: string;
  created_by: number;
  case: number;
  location: string;
}

// Other Evidence
export interface OtherEvidence extends BaseEvidence {}

export interface OtherEvidenceDetail extends OtherEvidence {}

export interface CreateOtherEvidenceRequest {
  title: string;
  description: string;
  seen_at: string;
  created_by: number;
  case: number;
  location: string;
}

// Union types for all evidence
export type AnyEvidence =
  | Testimony
  | BiologicalEvidence
  | VehicleEvidence
  | IdentificationEvidence
  | OtherEvidence;

export type AnyEvidenceDetail =
  | TestimonyDetail
  | BiologicalEvidenceDetail
  | VehicleEvidenceDetail
  | IdentificationEvidenceDetail
  | OtherEvidenceDetail;
