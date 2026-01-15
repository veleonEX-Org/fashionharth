CREATE TABLE IF NOT EXISTS trending_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  original_url TEXT NOT NULL UNIQUE,
  image_url TEXT,
  source_name TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_trending_news_created_at ON trending_news(created_at);
