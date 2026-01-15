-- Add user_id to customers table to link customers to registered users
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add customer_id to users table to link users to existing customers
ALTER TABLE users
ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add unique constraint to ensure one-to-one relationship
-- A user can only be linked to one customer and vice versa
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_user_id_unique ON customers(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_customer_id_unique ON users(customer_id) WHERE customer_id IS NOT NULL;
