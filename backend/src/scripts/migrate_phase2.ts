import { pool } from "../database/pool.js";

export async function migratePhase2() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("Starting Phase 2 Migration...");

    // Create 'customized_looks' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customized_looks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        custom_color VARCHAR(50),
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create 'favorites' table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, item_id)
      );
    `);

    await client.query("COMMIT");
    console.log("Migration completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
  }
}

migratePhase2();
