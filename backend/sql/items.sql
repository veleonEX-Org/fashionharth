-- Items table for CRUD operations example
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  story TEXT,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  inspired_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist
ALTER TABLE items ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'General';
ALTER TABLE items ADD COLUMN IF NOT EXISTS story TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_trending BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS inspired_image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_items_created_by ON items(created_by);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);




