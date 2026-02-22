import http from "@/lib/http";
import type {
  EvidenceDetail,
  CreateEvidenceRequest,
  EvidenceListResponse,
  EvidenceSummary,
  ForensicEvidence,
} from "@/types/evidence.type";

// Get all evidence for a case
export const getEvidenceByCase = async (
  caseId: number,
): Promise<EvidenceDetail[]> => {
  const response = await http.get<EvidenceDetail[]>(
    `/crime/cases/${caseId}/evidence/`,
  );
  return response.data;
};

// Get all evidence with pagination and filters
export const getEvidence = async (params?: {
  case_id?: number;
  evidence_type?: string;
  limit?: number;
  offset?: number;
}): Promise<EvidenceListResponse> => {
  const response = await http.get<EvidenceListResponse>("/crime/evidence/", {
    params,
  });
  return response.data;
};

// Get single evidence detail
export const getEvidenceById = async (id: number): Promise<EvidenceDetail> => {
  const response = await http.get<EvidenceDetail>(`/crime/evidence/${id}/`);
  return response.data;
};

// Create new evidence
export const createEvidence = async (
  data: CreateEvidenceRequest,
): Promise<EvidenceDetail> => {
  const formData = new FormData();

  // Add basic fields
  formData.append("case", data.case.toString());
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("evidence_type", data.evidence_type);
  formData.append("recorded_at", data.recorded_at);

  // Type-specific fields
  switch (data.evidence_type) {
    case "witness_testimony":
      if (data.witness_name) formData.append("witness_name", data.witness_name);
      if (data.witness_contact)
        formData.append("witness_contact", data.witness_contact);
      if (data.statement) formData.append("statement", data.statement);
      break;

    case "forensic":
      if (data.forensic_type)
        formData.append("forensic_type", data.forensic_type);
      if (data.collection_location)
        formData.append("collection_location", data.collection_location);
      if (data.test_status) formData.append("test_status", data.test_status);
      break;

    case "vehicle":
      if (data.vehicle_model)
        formData.append("vehicle_model", data.vehicle_model);
      if (data.vehicle_color)
        formData.append("vehicle_color", data.vehicle_color);
      if (data.plate_number) formData.append("plate_number", data.plate_number);
      if (data.serial_number)
        formData.append("serial_number", data.serial_number);
      if (data.info_type) formData.append("info_type", data.info_type);
      break;

    case "identification":
      if (data.discovered_person_name)
        formData.append("discovered_person_name", data.discovered_person_name);
      if (data.person_details) {
        formData.append("person_details", JSON.stringify(data.person_details));
      }
      break;

    case "other":
      if (data.custom_properties) {
        formData.append(
          "custom_properties",
          JSON.stringify(data.custom_properties),
        );
      }
      break;
  }

  // Add media files if provided
  if (data.media_files && data.media_files.length > 0) {
    data.media_files.forEach((file) => {
      formData.append(`media_files`, file);
    });
  }

  const response = await http.post<EvidenceDetail>(
    "/crime/evidence/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// Update evidence
export const updateEvidence = async (
  id: number,
  data: Partial<CreateEvidenceRequest>,
): Promise<EvidenceDetail> => {
  const response = await http.patch<EvidenceDetail>(
    `/crime/evidence/${id}/`,
    data,
  );
  return response.data;
};

// Delete evidence
export const deleteEvidence = async (id: number): Promise<void> => {
  await http.delete(`/crime/evidence/${id}/`);
};

// Update forensic test results
export const updateForensicTestResults = async (
  evidenceId: number,
  data: {
    test_status: "pending" | "in_progress" | "completed" | "error";
    test_result?: string;
  },
): Promise<ForensicEvidence> => {
  const response = await http.patch<ForensicEvidence>(
    `/crime/evidence/${evidenceId}/update-forensic-result/`,
    data,
  );
  return response.data;
};

// Get evidence summary for case
export const getEvidenceSummary = async (
  caseId: number,
): Promise<EvidenceSummary> => {
  const response = await http.get<EvidenceSummary>(
    `/crime/cases/${caseId}/evidence-summary/`,
  );
  return response.data;
};

// Search evidence
export const searchEvidence = async (
  query: string,
): Promise<EvidenceDetail[]> => {
  const response = await http.get<EvidenceDetail[]>("/crime/evidence/search/", {
    params: { q: query },
  });
  return response.data;
};
