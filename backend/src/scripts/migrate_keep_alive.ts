import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";

async function migrate() {
  logger.info("Running keep-alive table migration...");
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fashionheart (
        id INT PRIMARY KEY DEFAULT 1,
        status INT NOT NULL DEFAULT 1,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure at least one row exists
    await pool.query(`
      INSERT INTO fashionheart (id, status) 
      VALUES (1, 1) 
      ON CONFLICT (id) DO NOTHING;
    `);

    logger.info("Keep-alive table migration completed successfully.");
  } catch (err) {
    logger.error("Keep-alive table migration failed:", err);
  } finally {
    process.exit();
  }
}

migrate();
