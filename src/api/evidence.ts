import http from "@/lib/http";
import type {
  Testimony,
  TestimonyDetail,
  CreateTestimonyRequest,
  BiologicalEvidence,
  BiologicalEvidenceDetail,
  CreateBiologicalEvidenceRequest,
  VehicleEvidence,
  VehicleEvidenceDetail,
  CreateVehicleEvidenceRequest,
  IdentificationEvidence,
  IdentificationEvidenceDetail,
  CreateIdentificationEvidenceRequest,
  OtherEvidence,
  OtherEvidenceDetail,
  CreateOtherEvidenceRequest,
  Image,
  Attachment,
} from "@/types/evidence.type";

// ==================== Images ====================
export const uploadImage = async (file: File): Promise<Image> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await http.post<Image>("/witness/images/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getImage = async (id: number): Promise<Image> => {
  const response = await http.get<Image>(`/witness/images/${id}/`);
  return response.data;
};

export const deleteImage = async (id: number): Promise<void> => {
  await http.delete(`/witness/images/${id}/`);
};

// ==================== Attachments ====================
export const uploadAttachment = async (file: File): Promise<Attachment> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post<Attachment>(
    "/witness/attachments/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const getAttachment = async (id: number): Promise<Attachment> => {
  const response = await http.get<Attachment>(`/witness/attachments/${id}/`);
  return response.data;
};

export const deleteAttachment = async (id: number): Promise<void> => {
  await http.delete(`/witness/attachments/${id}/`);
};

// ==================== Testimonies ====================
export const getTestimonies = async (): Promise<Testimony[]> => {
  const response = await http.get<Testimony[]>("/witness/testimonies/");
  return response.data;
};

export const getTestimony = async (id: number): Promise<TestimonyDetail> => {
  const response = await http.get<TestimonyDetail>(
    `/witness/testimonies/${id}/`,
  );
  return response.data;
};

export const createTestimony = async (
  data: CreateTestimonyRequest,
): Promise<Testimony> => {
  const response = await http.post<Testimony>("/witness/testimonies/", data);
  return response.data;
};

export const updateTestimony = async (
  id: number,
  data: Partial<CreateTestimonyRequest>,
): Promise<Testimony> => {
  const response = await http.patch<Testimony>(
    `/witness/testimonies/${id}/`,
    data,
  );
  return response.data;
};

export const deleteTestimony = async (id: number): Promise<void> => {
  await http.delete(`/witness/testimonies/${id}/`);
};

// ==================== Biological Evidence ====================
export const getBiologicalEvidences = async (): Promise<
  BiologicalEvidence[]
> => {
  const response = await http.get<BiologicalEvidence[]>(
    "/witness/biological-evidence/",
  );
  return response.data;
};

export const getBiologicalEvidence = async (
  id: number,
): Promise<BiologicalEvidenceDetail> => {
  const response = await http.get<BiologicalEvidenceDetail>(
    `/witness/biological-evidence/${id}/`,
  );
  return response.data;
};

export const createBiologicalEvidence = async (
  data: CreateBiologicalEvidenceRequest,
): Promise<BiologicalEvidence> => {
  const response = await http.post<BiologicalEvidence>(
    "/witness/biological-evidence/",
    data,
  );
  return response.data;
};

export const updateBiologicalEvidence = async (
  id: number,
  data: Partial<CreateBiologicalEvidenceRequest>,
): Promise<BiologicalEvidence> => {
  const response = await http.patch<BiologicalEvidence>(
    `/witness/biological-evidence/${id}/`,
    data,
  );
  return response.data;
};

export const deleteBiologicalEvidence = async (id: number): Promise<void> => {
  await http.delete(`/witness/biological-evidence/${id}/`);
};

// ==================== Vehicle Evidence ====================
export const getVehicleEvidences = async (): Promise<VehicleEvidence[]> => {
  const response = await http.get<VehicleEvidence[]>(
    "/witness/vehicle-evidence/",
  );
  return response.data;
};

export const getVehicleEvidence = async (
  id: number,
): Promise<VehicleEvidenceDetail> => {
  const response = await http.get<VehicleEvidenceDetail>(
    `/witness/vehicle-evidence/${id}/`,
  );
  return response.data;
};

export const createVehicleEvidence = async (
  data: CreateVehicleEvidenceRequest,
): Promise<VehicleEvidence> => {
  const response = await http.post<VehicleEvidence>(
    "/witness/vehicle-evidence/",
    data,
  );
  return response.data;
};

export const updateVehicleEvidence = async (
  id: number,
  data: Partial<CreateVehicleEvidenceRequest>,
): Promise<VehicleEvidence> => {
  const response = await http.patch<VehicleEvidence>(
    `/witness/vehicle-evidence/${id}/`,
    data,
  );
  return response.data;
};

export const deleteVehicleEvidence = async (id: number): Promise<void> => {
  await http.delete(`/witness/vehicle-evidence/${id}/`);
};

// ==================== Identification Evidence ====================
export const getIdentificationEvidences = async (): Promise<
  IdentificationEvidence[]
> => {
  const response = await http.get<IdentificationEvidence[]>(
    "/witness/identification-evidence/",
  );
  return response.data;
};

export const getIdentificationEvidence = async (
  id: number,
): Promise<IdentificationEvidenceDetail> => {
  const response = await http.get<IdentificationEvidenceDetail>(
    `/witness/identification-evidence/${id}/`,
  );
  return response.data;
};

export const createIdentificationEvidence = async (
  data: CreateIdentificationEvidenceRequest,
): Promise<IdentificationEvidence> => {
  const response = await http.post<IdentificationEvidence>(
    "/witness/identification-evidence/",
    data,
  );
  return response.data;
};

export const updateIdentificationEvidence = async (
  id: number,
  data: Partial<CreateIdentificationEvidenceRequest>,
): Promise<IdentificationEvidence> => {
  const response = await http.patch<IdentificationEvidence>(
    `/witness/identification-evidence/${id}/`,
    data,
  );
  return response.data;
};

export const deleteIdentificationEvidence = async (
  id: number,
): Promise<void> => {
  await http.delete(`/witness/identification-evidence/${id}/`);
};

// ==================== Other Evidence ====================
export const getOtherEvidences = async (): Promise<OtherEvidence[]> => {
  const response = await http.get<OtherEvidence[]>("/witness/other-evidence/");
  return response.data;
};

export const getOtherEvidence = async (
  id: number,
): Promise<OtherEvidenceDetail> => {
  const response = await http.get<OtherEvidenceDetail>(
    `/witness/other-evidence/${id}/`,
  );
  return response.data;
};

export const createOtherEvidence = async (
  data: CreateOtherEvidenceRequest,
): Promise<OtherEvidence> => {
  const response = await http.post<OtherEvidence>(
    "/witness/other-evidence/",
    data,
  );
  return response.data;
};

export const updateOtherEvidence = async (
  id: number,
  data: Partial<CreateOtherEvidenceRequest>,
): Promise<OtherEvidence> => {
  const response = await http.patch<OtherEvidence>(
    `/witness/other-evidence/${id}/`,
    data,
  );
  return response.data;
};

export const deleteOtherEvidence = async (id: number): Promise<void> => {
  await http.delete(`/witness/other-evidence/${id}/`);
};
