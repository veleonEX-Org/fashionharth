import { pool } from "../database/pool.js";

/**
 * Migration: Create measurement fields and categories tables
 * This allows dynamic measurement fields and dress categories
 */
async function migrate() {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    // Create categories table for dress types
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create measurement_fields table for reusable measurement definitions
    await client.query(`
      CREATE TABLE IF NOT EXISTS measurement_fields (
        id SERIAL PRIMARY KEY,
        field_name VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        unit VARCHAR(20) DEFAULT 'inches',
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert default categories
    await client.query(`
      INSERT INTO categories (name, description, display_order) VALUES
        ('Kaftan', 'Traditional flowing robe', 1),
        ('Suit', 'Formal business suit', 2),
        ('Agbada', 'Wide-sleeved robe', 3),
        ('Dress', 'Women''s dress', 4),
        ('Shirt', 'Casual or formal shirt', 5)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert default measurement fields
    await client.query(`
      INSERT INTO measurement_fields (field_name, display_name, unit, display_order) VALUES
        ('length', 'Length', 'inches', 1),
        ('chest', 'Chest', 'inches', 2),
        ('waist', 'Waist', 'inches', 3),
        ('shoulder', 'Shoulder', 'inches', 4),
        ('sleeve', 'Sleeve', 'inches', 5),
        ('neck', 'Neck', 'inches', 6),
        ('hip', 'Hip', 'inches', 7),
        ('inseam', 'Inseam', 'inches', 8),
        ('arm_hole', 'Arm Hole', 'inches', 9),
        ('thigh', 'Thigh', 'inches', 10),
        ('calf', 'Calf', 'inches', 11),
        ('ankle', 'Ankle', 'inches', 12)
      ON CONFLICT (field_name) DO NOTHING;
    `);

    await client.query("COMMIT");
    console.log("✅ Migration completed successfully!");
    console.log("   - Created categories table");
    console.log("   - Created measurement_fields table");
    console.log("   - Inserted default categories and measurement fields");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
