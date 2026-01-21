-- Payment Tables

-- User Payment Profiles (linked to Stripe/Paystack customers)
CREATE TABLE IF NOT EXISTS user_payment_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'stripe' or 'paystack'
    customer_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Payment Plans (for Subscriptions and Installments)
CREATE TABLE IF NOT EXISTS payment_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    interval VARCHAR(50), -- 'day', 'week', 'month', 'year', or 'one-time'
    interval_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    provider_plan_id VARCHAR(255), -- ID in Stripe/Paystack
    type VARCHAR(50) NOT NULL, -- 'subscription', 'one-time', 'installment'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES payment_plans(id),
    provider_subscription_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due', 'incomplete'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions/Payments
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL, -- 'pending', 'succeeded', 'failed', 'refunded'
    type VARCHAR(50) NOT NULL, -- 'one-time', 'subscription', 'installment'
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'paystack'
    provider_payment_id VARCHAR(255) UNIQUE, -- PaymentIntent ID or similar
    provider_checkout_id VARCHAR(255), -- Session ID
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Installment Tracking
CREATE TABLE IF NOT EXISTS installments (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    total_installments INTEGER NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'paid', 'overdue'
    provider_payment_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
