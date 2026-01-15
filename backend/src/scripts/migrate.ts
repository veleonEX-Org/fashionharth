import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    logger.info("Starting database migrations...");

    const sqlFiles = [
      "schema.sql",
      "items.sql",
      "payments.sql",
      "chat.sql",
      "admin_tables.sql",
      "trending_news.sql",
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, "../../sql/", file);
      if (fs.existsSync(filePath)) {
        logger.info(`Executing ${file}...`);
        const sql = fs.readFileSync(filePath, "utf-8");
        await pool.query(sql);
        logger.info(`✓ ${file} executed successfully`);
      } else {
        logger.warn(`File ${file} not found, skipping.`);
      }
    }

    // Run additional migrations from migrations directory
    const migrationsDir = path.join(__dirname, "../../sql/migrations");
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
      for (const migration of migrations) {
        logger.info(`Executing migration ${migration}...`);
        const migrationPath = path.join(migrationsDir, migration);
        const sql = fs.readFileSync(migrationPath, "utf-8");
        await pool.query(sql);
        logger.info(`✓ ${migration} executed successfully`);
      }
    }

    logger.info("✓ All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
