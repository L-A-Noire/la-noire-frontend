import http from "@/lib/http";
import type {
  CrimeScene,
  CrimeSceneDetail,
  CreateCrimeSceneRequest,
} from "@/types/crime-scene.type";

export const getCrimeScenes = async (): Promise<CrimeSceneDetail[]> => {
  const response = await http.get<CrimeSceneDetail[]>("/crime/crime-scenes/");
  return response.data;
};

export const getCrimeSceneById = async (
  id: number,
): Promise<CrimeSceneDetail> => {
  const response = await http.get<CrimeSceneDetail>(
    `/crime/crime-scenes/${id}/`,
  );
  return response.data;
};

export const createCrimeScene = async (
  data: CreateCrimeSceneRequest,
): Promise<CrimeScene> => {
  const response = await http.post<CrimeScene>("/crime/crime-scenes/", data);
  return response.data;
};

export const updateCrimeScene = async (
  id: number,
  data: Partial<CreateCrimeSceneRequest>,
): Promise<CrimeScene> => {
  const response = await http.patch<CrimeScene>(
    `/crime/crime-scenes/${id}/`,
    data,
  );
  return response.data;
};

export const deleteCrimeScene = async (id: number): Promise<void> => {
  await http.delete(`/crime/crime-scenes/${id}/`);
};

export const confirmCrimeScene = async (id: number): Promise<CrimeScene> => {
  const response = await http.post<CrimeScene>(
    `/crime/crime-scenes/${id}/confirm/`,
  );
  return response.data;
};

export const confirmCrimeSceneAndCreateCase = async (
  id: number,
  data: { crime_level: number },
): Promise<void> => {
  await http.post(`/crime/crime-scenes/${id}/confirm/`, data);
};
