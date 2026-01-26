-- Migration to add quantity and production_notes to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS production_notes TEXT;
