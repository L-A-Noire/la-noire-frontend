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

// Testimony Evidence
export interface Testimony {
  id: number;
  title: string;
  description: string;
  transcription: string;
  attachments: number[];
  created_at: string;
  created_by: number;
}

export interface TestimonyDetail extends Testimony {
  attachment_details?: Attachment[];
  created_by_name?: string;
}

export interface CreateTestimonyRequest {
  title: string;
  description: string;
  transcription: string;
  attachments: number[];
  created_at: string;
  created_by: number;
}

// Biological Evidence
export interface BiologicalEvidence {
  id: number;
  title: string;
  description: string;
  images: number[];
  result?: string | null;
  coronary?: number | null;
  created_at: string;
  created_by: number;
}

export interface BiologicalEvidenceDetail extends BiologicalEvidence {
  image_details?: Image[];
  created_by_name?: string;
}

export interface CreateBiologicalEvidenceRequest {
  title: string;
  description: string;
  images: number[];
  result?: string | null;
  coronary?: number | null;
  created_at: string;
  created_by: number;
}

// Vehicle Evidence
export interface VehicleEvidence {
  id: number;
  title: string;
  description: string;
  vehicle_model: string;
  color: string;
  registration_plate_number?: string | null;
  serial_number?: string | null;
  created_at: string;
  created_by: number;
}

export interface VehicleEvidenceDetail extends VehicleEvidence {
  created_by_name?: string;
}

export interface CreateVehicleEvidenceRequest {
  title: string;
  description: string;
  vehicle_model: string;
  color: string;
  registration_plate_number?: string | null;
  serial_number?: string | null;
  created_at: string;
  created_by: number;
}

// Identification Evidence
export interface IdentificationEvidence {
  id: number;
  title: string;
  description: string;
  owner_first_name: string;
  owner_last_name: string;
  information?: Record<string, any>;
  created_at: string;
  created_by: number;
}

export interface IdentificationEvidenceDetail extends IdentificationEvidence {
  created_by_name?: string;
}

export interface CreateIdentificationEvidenceRequest {
  title: string;
  description: string;
  owner_first_name: string;
  owner_last_name: string;
  information?: Record<string, any>;
  created_at: string;
  created_by: number;
}

// Other Evidence
export interface OtherEvidence {
  id: number;
  title: string;
  description: string;
  created_at: string;
  created_by: number;
}

export interface OtherEvidenceDetail extends OtherEvidence {
  created_by_name?: string;
}

export interface CreateOtherEvidenceRequest {
  title: string;
  description: string;
  created_at: string;
  created_by: number;
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
