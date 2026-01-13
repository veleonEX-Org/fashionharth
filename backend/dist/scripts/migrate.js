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
        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, "../../sql/schema.sql");
        const schemaSQL = fs.readFileSync(schemaPath, "utf-8");
        logger.info("Creating users table...");
        await pool.query(schemaSQL);
        logger.info("✓ Users table created successfully");
        // Read and execute items.sql
        const itemsPath = path.join(__dirname, "../../sql/items.sql");
        const itemsSQL = fs.readFileSync(itemsPath, "utf-8");
        logger.info("Creating items table...");
        await pool.query(itemsSQL);
        logger.info("✓ Items table created successfully");
        // Read and execute payments.sql
        const paymentsPath = path.join(__dirname, "../../sql/payments.sql");
        const paymentsSQL = fs.readFileSync(paymentsPath, "utf-8");
        logger.info("Creating payments tables...");
        await pool.query(paymentsSQL);
        logger.info("✓ Payments tables created successfully");
        // Read and execute chat.sql
        const chatPath = path.join(__dirname, "../../sql/chat.sql");
        const chatSQL = fs.readFileSync(chatPath, "utf-8");
        logger.info("Creating chat tables...");
        await pool.query(chatSQL);
        logger.info("✓ Chat tables created successfully");
        // Read and execute admin_tables.sql
        const adminTablesPath = path.join(__dirname, "../../sql/admin_tables.sql");
        const adminTablesSQL = fs.readFileSync(adminTablesPath, "utf-8");
        logger.info("Creating admin tables (customers, tasks)...");
        await pool.query(adminTablesSQL);
        logger.info("✓ Admin tables created successfully");
        logger.info("✓ All migrations completed successfully!");
        process.exit(0);
    }
    catch (error) {
        logger.error("Migration failed:", error);
        process.exit(1);
    }
}
runMigrations();
