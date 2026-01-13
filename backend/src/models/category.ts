export interface Category {
  id: number;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
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

export interface CreateMeasurementFieldPayload {
  fieldName: string;
  displayName: string;
  unit?: string;
  displayOrder?: number;
}

export interface UpdateMeasurementFieldPayload {
  fieldName?: string;
  displayName?: string;
  unit?: string;
  displayOrder?: number;
  isActive?: boolean;
}
