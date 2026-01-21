import { pool } from "../database/pool.js";
import { SystemSetting, UpdateSystemSettingPayload } from "../models/systemSettings.js";

export async function getSystemSetting(key: string): Promise<SystemSetting | null> {
  const result = await pool.query(
    "SELECT key, value, description, updated_at FROM system_settings WHERE key = $1",
    [key]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    key: row.key,
    value: row.value,
    description: row.description,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllSystemSettings(): Promise<SystemSetting[]> {
  const result = await pool.query(
    "SELECT key, value, description, updated_at FROM system_settings ORDER BY key ASC"
  );

  return result.rows.map(row => ({
    key: row.key,
    value: row.value,
    description: row.description,
    updatedAt: row.updated_at.toISOString(),
  }));
}

export async function updateSystemSetting(key: string, data: UpdateSystemSettingPayload): Promise<SystemSetting | null> {
  const current = await getSystemSetting(key);
  if (!current) {
    // If it doesn't exist, create it (upsert-ish behavior for settings)
    const insert = await pool.query(
      "INSERT INTO system_settings (key, value, description) VALUES ($1, $2, $3) RETURNING key, value, description, updated_at",
      [key, data.value, data.description || null]
    );
    const row = insert.rows[0];
    return {
      key: row.key,
      value: row.value,
      description: row.description,
      updatedAt: row.updated_at.toISOString(),
    };
  }

  const result = await pool.query(
    "UPDATE system_settings SET value = $1, description = COALESCE($2, description), updated_at = NOW() WHERE key = $3 RETURNING key, value, description, updated_at",
    [data.value, data.description, key]
  );

  const row = result.rows[0];
  return {
    key: row.key,
    value: row.value,
    description: row.description,
    updatedAt: row.updated_at.toISOString(),
  };
}
