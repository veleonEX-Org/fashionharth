import { pool } from "../database/pool.js";
import type { 
  Category, 
  CreateCategoryPayload, 
  UpdateCategoryPayload,
  MeasurementField,
  CreateMeasurementFieldPayload,
  UpdateMeasurementFieldPayload
} from "../models/category.js";

// ============ CATEGORIES ============

export async function getAllCategories(): Promise<Category[]> {
  const result = await pool.query(
    `SELECT id, name, description, display_order, is_active, created_at, updated_at 
     FROM categories 
     WHERE is_active = true 
     ORDER BY display_order ASC, name ASC`
  );
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const result = await pool.query(
    `SELECT id, name, description, display_order, is_active, created_at, updated_at 
     FROM categories 
     WHERE id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function createCategory(data: CreateCategoryPayload): Promise<Category> {
  const result = await pool.query(
    `INSERT INTO categories (name, description, display_order) 
     VALUES ($1, $2, $3) 
     RETURNING id, name, description, display_order, is_active, created_at, updated_at`,
    [data.name, data.description || null, data.displayOrder || 0]
  );
  
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function updateCategory(id: number, data: UpdateCategoryPayload): Promise<Category | null> {
  const updates: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${idx++}`);
    params.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${idx++}`);
    params.push(data.description);
  }
  if (data.displayOrder !== undefined) {
    updates.push(`display_order = $${idx++}`);
    params.push(data.displayOrder);
  }
  if (data.isActive !== undefined) {
    updates.push(`is_active = $${idx++}`);
    params.push(data.isActive);
  }

  if (updates.length === 0) {
    return getCategoryById(id);
  }

  updates.push(`updated_at = NOW()`);
  params.push(id);

  const result = await pool.query(
    `UPDATE categories 
     SET ${updates.join(", ")} 
     WHERE id = $${idx} 
     RETURNING id, name, description, display_order, is_active, created_at, updated_at`,
    params
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function deleteCategory(id: number): Promise<boolean> {
  // Soft delete
  const result = await pool.query(
    `UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1`,
    [id]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

// ============ MEASUREMENT FIELDS ============

export async function getAllMeasurementFields(): Promise<MeasurementField[]> {
  const result = await pool.query(
    `SELECT id, field_name, display_name, unit, display_order, is_active, created_at, updated_at 
     FROM measurement_fields 
     WHERE is_active = true 
     ORDER BY display_order ASC, field_name ASC`
  );
  
  return result.rows.map(row => ({
    id: row.id,
    fieldName: row.field_name,
    displayName: row.display_name,
    unit: row.unit,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));
}

export async function getMeasurementFieldById(id: number): Promise<MeasurementField | null> {
  const result = await pool.query(
    `SELECT id, field_name, display_name, unit, display_order, is_active, created_at, updated_at 
     FROM measurement_fields 
     WHERE id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    fieldName: row.field_name,
    displayName: row.display_name,
    unit: row.unit,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function createMeasurementField(data: CreateMeasurementFieldPayload): Promise<MeasurementField> {
  const result = await pool.query(
    `INSERT INTO measurement_fields (field_name, display_name, unit, display_order) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, field_name, display_name, unit, display_order, is_active, created_at, updated_at`,
    [data.fieldName, data.displayName, data.unit || 'inches', data.displayOrder || 0]
  );
  
  const row = result.rows[0];
  return {
    id: row.id,
    fieldName: row.field_name,
    displayName: row.display_name,
    unit: row.unit,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function updateMeasurementField(id: number, data: UpdateMeasurementFieldPayload): Promise<MeasurementField | null> {
  const updates: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (data.fieldName !== undefined) {
    updates.push(`field_name = $${idx++}`);
    params.push(data.fieldName);
  }
  if (data.displayName !== undefined) {
    updates.push(`display_name = $${idx++}`);
    params.push(data.displayName);
  }
  if (data.unit !== undefined) {
    updates.push(`unit = $${idx++}`);
    params.push(data.unit);
  }
  if (data.displayOrder !== undefined) {
    updates.push(`display_order = $${idx++}`);
    params.push(data.displayOrder);
  }
  if (data.isActive !== undefined) {
    updates.push(`is_active = $${idx++}`);
    params.push(data.isActive);
  }

  if (updates.length === 0) {
    return getMeasurementFieldById(id);
  }

  updates.push(`updated_at = NOW()`);
  params.push(id);

  const result = await pool.query(
    `UPDATE measurement_fields 
     SET ${updates.join(", ")} 
     WHERE id = $${idx} 
     RETURNING id, field_name, display_name, unit, display_order, is_active, created_at, updated_at`,
    params
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    fieldName: row.field_name,
    displayName: row.display_name,
    unit: row.unit,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function deleteMeasurementField(id: number): Promise<boolean> {
  // Soft delete
  const result = await pool.query(
    `UPDATE measurement_fields SET is_active = false, updated_at = NOW() WHERE id = $1`,
    [id]
  );
  return result.rowCount !== null && result.rowCount > 0;
}
