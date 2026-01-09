import { pool } from "../database/pool.js";
import { Favorite, CustomizedLook } from "../models/look.js";

export async function addFavorite(userId: number, itemId: number): Promise<void> {
  await pool.query(
    "INSERT INTO favorites (user_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [userId, itemId]
  );
}

export async function removeFavorite(userId: number, itemId: number): Promise<void> {
  await pool.query(
    "DELETE FROM favorites WHERE user_id = $1 AND item_id = $2",
    [userId, itemId]
  );
}

export async function getFavorites(userId: number): Promise<any[]> {
  const result = await pool.query(
    `
    SELECT f.*, i.title, i.image_url, i.category, i.price
    FROM favorites f
    JOIN items i ON f.item_id = i.id
    WHERE f.user_id = $1
    `,
    [userId]
  );
  return result.rows;
}

export async function saveLook(userId: number, look: { itemId: number, customColor: string, avatarUrl?: string }): Promise<CustomizedLook> {
  const result = await pool.query(
    `
    INSERT INTO customized_looks (user_id, item_id, custom_color, avatar_url)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [userId, look.itemId, look.customColor, look.avatarUrl || null]
  );
  return result.rows[0];
}

export async function getSavedLooks(userId: number): Promise<CustomizedLook[]> {
  const result = await pool.query(
    `
    SELECT l.*, i.title as item_title, i.image_url as item_image
    FROM customized_looks l
    JOIN items i ON l.item_id = i.id
    WHERE l.user_id = $1
    ORDER BY l.created_at DESC
    `,
    [userId]
  );
  return result.rows;
}
