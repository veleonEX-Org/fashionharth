import { pool } from "../database/pool.js";

async function migrate() {
  console.log("Starting migration to remove role_access from items...");

  try {
    // Drop the role_access column
    await pool.query(`
      ALTER TABLE items 
      DROP COLUMN IF EXISTS role_access;
    `);

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit();
  }
}

migrate();
