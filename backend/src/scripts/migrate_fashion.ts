
import { pool } from "../database/pool.js";

async function migrate() {
  console.log("Starting migration to Fashion Store schema...");

  try {
    // Add columns if they don't exist
    await pool.query(`
      ALTER TABLE items 
      ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General',
      ADD COLUMN IF NOT EXISTS story TEXT,
      ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit();
  }
}

migrate();
