import { pool } from "../database/pool.js";

export async function migrateAdminSystem() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("Starting Admin System Migration...");

    // 1. Ensure 'items' table has new fashion columns (Idempotent check)
    await client.query(`
      ALTER TABLE items 
      ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General',
      ADD COLUMN IF NOT EXISTS story TEXT,
      ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);

    // 2. Create 'customers' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        measurements JSONB DEFAULT '{}',
        dob DATE,
        anniversary_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 3. Create 'tasks' table
    // status: 'pending', 'in_progress', 'completed'
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        category VARCHAR(100) NOT NULL, 
        total_amount DECIMAL(10, 2) DEFAULT 0.00,
        amount_paid DECIMAL(10, 2) DEFAULT 0.00,
        production_cost DECIMAL(10, 2) DEFAULT 0.00,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        start_date TIMESTAMP,
        due_date TIMESTAMP NOT NULL,
        deadline TIMESTAMP, -- Calculated internally (e.g. Due Date - 3 days)
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 4. Add 'role' column check or update if strictly needed (assuming users table has role)
    // We rely on existing user table 'role' column being varchar or enum.

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

migrateAdminSystem();
