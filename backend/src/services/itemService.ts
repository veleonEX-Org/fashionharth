import { z } from "zod";
import { pool } from "../database/pool.js";
import type { Item, PublicItem } from "../models/item.js";
import { toPublicItem } from "../models/item.js";
import type { UserRole } from "../types/auth.js";

const createItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(255, "Title must be less than 255 characters."),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  metadata: z.record(z.unknown()).nullable().optional(),
  price: z.number().min(0, "Price must be non-negative").default(0),
  category: z.string().default("General"),
  story: z.string().nullable().optional(),
  isTrending: z.boolean().default(false),
  imageUrl: z.string().url().nullable().optional(),
  inspiredImageUrl: z.string().url().nullable().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  installmentDuration: z.number().min(0).optional(),
});

const updateItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(255, "Title must be less than 255 characters.")
    .optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  price: z.number().min(0).optional(),
  category: z.string().optional(),
  story: z.string().nullable().optional(),
  isTrending: z.boolean().optional(),
  imageUrl: z.string().url().nullable().optional(),
  inspiredImageUrl: z.string().url().nullable().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  installmentDuration: z.number().min(0).optional(),
});

export interface PaginatedItems {
  items: PublicItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function createItem(
  userId: number,
  input: unknown
): Promise<PublicItem> {
  const data = createItemSchema.parse(input);

  // Merge legacy metadata with new fields
  const finalMetadata: Record<string, any> = {
    ...(data.metadata || {}),
  };
  
  if (data.discountPercentage !== undefined) {
    finalMetadata.discount_percentage = data.discountPercentage;
  }
  if (data.installmentDuration !== undefined) {
    finalMetadata.installment_duration = data.installmentDuration;
  }

  const result = await pool.query<Item>(
    `
      INSERT INTO items (
        title, description, status, created_by, metadata,
        price, category, story, is_trending, image_url, inspired_image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [
      data.title,
      data.description || null,
      data.status,
      userId,
      JSON.stringify(finalMetadata),
      data.price,
      data.category,
      data.story || null,
      data.isTrending,
      data.imageUrl || null,
      data.inspiredImageUrl || null,
    ]
  );

  return toPublicItem(result.rows[0]);
}

export async function getItems(
  userId: number,
  page: number = 1,
  limit: number = 10,
  status?: string,
  search?: string
): Promise<PaginatedItems> {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;



  // Filter by status if provided
  if (status && ["active", "inactive", "archived"].includes(status)) {
    conditions.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  // Search filter
  if (search) {
    conditions.push(
      `(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
    );
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM items ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get items
  const limitParam = paramIndex;
  const offsetParam = paramIndex + 1;
  const itemsResult = await pool.query<Item>(
    `
      SELECT * FROM items
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `,
    [...params, limit, offset]
  );

  return {
    items: itemsResult.rows.map(toPublicItem),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getItemById(
  id: number
): Promise<PublicItem | null> {
  const result = await pool.query<Item>(
    `
      SELECT * FROM items
      WHERE id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return toPublicItem(result.rows[0]);
}

export async function updateItem(
  id: number,
  userId: number,
  userRole: UserRole,
  input: unknown
): Promise<PublicItem> {
  const data = updateItemSchema.parse(input);

  // Check if item exists and user has access
  const existing = await getItemById(id);
  if (!existing) {
    const error = new Error("Item not found or access denied.");
    (error as any).statusCode = 404;
    throw error;
  }

  // Only allow creator or admin to update
  if (existing.createdBy !== userId && userRole !== "admin") {
    const error = new Error("You don't have permission to update this item.");
    (error as any).statusCode = 403;
    throw error;
  }

  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramIndex}`);
    params.push(data.title);
    paramIndex++;
  }

  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex}`);
    params.push(data.description);
    paramIndex++;
  }

  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    params.push(data.status);
    paramIndex++;
  }



  let metadataChanged = false;
  const mergedMetadata = { ...(existing.metadata as Record<string, any> || {}) };

  if (data.metadata !== undefined) {
      if (data.metadata) {
          Object.assign(mergedMetadata, data.metadata);
      }
      metadataChanged = true;
  }

  if (data.discountPercentage !== undefined) {
      mergedMetadata.discount_percentage = data.discountPercentage;
      metadataChanged = true;
  }

  if (data.installmentDuration !== undefined) {
      mergedMetadata.installment_duration = data.installmentDuration;
      metadataChanged = true;
  }

  if (metadataChanged) {
    updates.push(`metadata = $${paramIndex}`);
    params.push(JSON.stringify(mergedMetadata));
    paramIndex++;
  }

  if (data.price !== undefined) {
    updates.push(`price = $${paramIndex}`);
    params.push(data.price);
    paramIndex++;
  }

  if (data.category !== undefined) {
    updates.push(`category = $${paramIndex}`);
    params.push(data.category);
    paramIndex++;
  }

  if (data.story !== undefined) {
    updates.push(`story = $${paramIndex}`);
    params.push(data.story);
    paramIndex++;
  }

  if (data.isTrending !== undefined) {
    updates.push(`is_trending = $${paramIndex}`);
    params.push(data.isTrending);
    paramIndex++;
  }

  if (data.imageUrl !== undefined) {
    updates.push(`image_url = $${paramIndex}`);
    params.push(data.imageUrl);
    paramIndex++;
  }

  if (data.inspiredImageUrl !== undefined) {
    updates.push(`inspired_image_url = $${paramIndex}`);
    params.push(data.inspiredImageUrl);
    paramIndex++;
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push(`updated_at = NOW()`);
  params.push(id);

  const result = await pool.query<Item>(
    `
      UPDATE items
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `,
    params
  );

  return toPublicItem(result.rows[0]);
}

export async function deleteItem(
  id: number,
  userId: number,
  userRole: UserRole
): Promise<void> {
  // Check if item exists and user has access
  const existing = await getItemById(id);
  if (!existing) {
    const error = new Error("Item not found or access denied.");
    (error as any).statusCode = 404;
    throw error;
  }

  // Only allow creator or admin to delete
  if (existing.createdBy !== userId && userRole !== "admin") {
    const error = new Error("You don't have permission to delete this item.");
    (error as any).statusCode = 403;
    throw error;
  }

  await pool.query("DELETE FROM items WHERE id = $1", [id]);
}

export async function getPublicItems(
  page: number = 1,
  limit: number = 10,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  isTrending?: boolean,
  search?: string
): Promise<PaginatedItems> {
  const offset = (page - 1) * limit;
  const conditions: string[] = ["status = 'active'"];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (category) {
    conditions.push(`category ILIKE $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  if (minPrice !== undefined) {
    conditions.push(`price >= $${paramIndex}`);
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== undefined) {
    conditions.push(`price <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  if (isTrending !== undefined) {
    conditions.push(`is_trending = $${paramIndex}`);
    params.push(isTrending);
    paramIndex++;
  }

  if (search) {
    conditions.push(
      `(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
    );
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM items ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const limitParam = paramIndex;
  const offsetParam = paramIndex + 1;
  const itemsResult = await pool.query<Item>(
    `
      SELECT * FROM items
      ${whereClause}
      ORDER BY is_trending DESC, created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `,
    [...params, limit, offset]
  );

  return {
    items: itemsResult.rows.map(toPublicItem),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

