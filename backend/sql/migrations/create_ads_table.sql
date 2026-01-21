-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  badge_text VARCHAR(100),
  offer_text VARCHAR(100),
  offer_subtext VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
