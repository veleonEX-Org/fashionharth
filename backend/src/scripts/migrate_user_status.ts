import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";

async function migrate() {
  try {
    logger.info("Starting user status migration...");

    // Add status column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
    `);

    logger.info("✓ User status migration completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
