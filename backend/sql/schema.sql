-- PostgreSQL schema for the fullstack starter template.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  customer_id INTEGER,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expires_at TIMESTAMPTZ,
  refresh_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_customer_id_unique ON users(customer_id) WHERE customer_id IS NOT NULL;






