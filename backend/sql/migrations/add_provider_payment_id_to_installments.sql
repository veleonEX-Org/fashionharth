-- Migration to add provider_payment_id to installments table
ALTER TABLE installments ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(255);
