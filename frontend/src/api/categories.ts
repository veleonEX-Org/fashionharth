import { http } from "./http";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementField {
  id: number;
  fieldName: string;
  displayName: string;
  unit: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Categories
export async function fetchCategories(): Promise<Category[]> {
  const response = await http.get<Category[]>("/categories");
  return response.data;
}

export async function createCategory(data: {
  name: string;
  description?: string;
  displayOrder?: number;
}): Promise<Category> {
  const response = await http.post<Category>("/categories", data);
  return response.data;
}

export async function updateCategory(
  id: number,
  data: {
    name?: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
  }
): Promise<Category> {
  const response = await http.put<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await http.delete(`/categories/${id}`);
}

// Measurement Fields
export async function fetchMeasurementFields(): Promise<MeasurementField[]> {
  const response = await http.get<MeasurementField[]>("/measurement-fields");
  return response.data;
}

export async function createMeasurementField(data: {
  fieldName: string;
  displayName: string;
  unit?: string;
  displayOrder?: number;
}): Promise<MeasurementField> {
  const response = await http.post<MeasurementField>("/measurement-fields", data);
  return response.data;
}

export async function updateMeasurementField(
  id: number,
  data: {
    fieldName?: string;
    displayName?: string;
    unit?: string;
    displayOrder?: number;
    isActive?: boolean;
  }
): Promise<MeasurementField> {
  const response = await http.put<MeasurementField>(`/measurement-fields/${id}`, data);
  return response.data;
}

export async function deleteMeasurementField(id: number): Promise<void> {
  await http.delete(`/measurement-fields/${id}`);
}
