CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default prompts if they don't exist
INSERT INTO system_settings (key, value, description)
VALUES 
  ('trending_crawl_prompt', 'latest fashion trends, runway collections, street style 2024', 'Search terms used to find trending content'),
  ('trending_summary_prompt', 'Rewrite the following fashion news into a sophisticated 2-sentence summary for FashionHarth. Focus on style implications.', 'Prompt for the AI to summarize trends')
ON CONFLICT (key) DO NOTHING;
