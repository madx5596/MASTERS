-- MASTERS KRK / BeautyKRK Database Schema
-- Migration 001: Initial schema

-- ============ ENUMS ============
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'CONTENT_ADMIN', 'ANALYST', 'PROVIDER', 'CUSTOMER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');
CREATE TYPE business_type AS ENUM ('BEAUTY', 'AUTO', 'BARBERSHOP', 'REPAIR', 'CLEANING', 'EDUCATION', 'OTHER');
CREATE TYPE provider_status AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');
CREATE TYPE service_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE wallet_status AS ENUM ('ACTIVE', 'BLOCKED');
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'PROMOTION', 'ADVERTISEMENT', 'PREMIUM', 'REFUND', 'BONUS', 'ADJUSTMENT');
CREATE TYPE payment_purpose AS ENUM ('WALLET_TOPUP', 'PROMOTION', 'ADVERTISEMENT', 'PREMIUM', 'SERVICE', 'SUBSCRIPTION');
CREATE TYPE payment_status AS ENUM ('CREATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'EXPIRED', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE promotion_status AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED', 'ARCHIVED');
CREATE TYPE advertisement_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED', 'ARCHIVED');
CREATE TYPE premium_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED');
CREATE TYPE notification_type AS ENUM (
  'BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED',
  'PAYMENT_CREATED', 'PAYMENT_PENDING', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'PAYMENT_CANCELED',
  'WALLET_TOPUP_SUCCEEDED', 'WALLET_DEBIT', 'WALLET_REFUND', 'WALLET_MANUAL_ADJUSTMENT',
  'PROMOTION_STARTED', 'PROMOTION_ENDED',
  'ADVERTISEMENT_APPROVED', 'ADVERTISEMENT_REJECTED',
  'PREMIUM_STARTED', 'PREMIUM_EXPIRED'
);
CREATE TYPE schedule_exception_type AS ENUM ('DAY_OFF', 'CUSTOM_HOURS', 'VACATION');

-- ============ USERS ============
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar TEXT,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============ ORGANIZATIONS ============
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  business_type business_type NOT NULL DEFAULT 'BEAUTY',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  owner_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ PROVIDERS ============
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  avatar TEXT,
  specializations TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status provider_status NOT NULL DEFAULT 'ACTIVE',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_providers_user ON providers(user_id);
CREATE INDEX idx_providers_org ON providers(organization_id);
CREATE INDEX idx_providers_status ON providers(status);

-- ============ CUSTOMERS ============
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_user ON customers(user_id);

-- ============ SERVICE CATEGORIES ============
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  business_type business_type NOT NULL DEFAULT 'BEAUTY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ SERVICES ============
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  duration INTEGER NOT NULL CHECK (duration > 0),
  status service_status NOT NULL DEFAULT 'ACTIVE',
  category_id UUID REFERENCES service_categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_status ON services(status);

-- ============ SCHEDULES ============
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(provider_id, day_of_week)
);

CREATE INDEX idx_schedules_provider ON schedules(provider_id);

-- ============ SCHEDULE EXCEPTIONS ============
CREATE TABLE schedule_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id),
  date DATE NOT NULL,
  type schedule_exception_type NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  UNIQUE(provider_id, date)
);

CREATE INDEX idx_schedule_exceptions_provider_date ON schedule_exceptions(provider_id, date);

-- ============ APPOINTMENTS ============
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  service_id UUID NOT NULL REFERENCES services(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'PENDING',
  price INTEGER NOT NULL CHECK (price >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_at > start_at)
);

CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_start ON appointments(start_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Prevent double booking: unique constraint on provider + time range
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE appointments ADD CONSTRAINT no_overlap
  EXCLUDE USING gist (
    provider_id WITH =,
    tstzrange(start_at, end_at) WITH &&
  ) WHERE (status NOT IN ('CANCELLED', 'NO_SHOW'));

-- ============ WALLETS ============
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES providers(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
  status wallet_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- ============ TRANSACTIONS ============
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id VARCHAR(255),
  payment_id UUID,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- ============ PAYMENTS ============
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  purpose payment_purpose NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
  provider VARCHAR(50) NOT NULL DEFAULT 'YooKassa',
  provider_payment_id VARCHAR(255),
  status payment_status NOT NULL DEFAULT 'CREATED',
  payment_url TEXT,
  idempotency_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_id ON payments(provider_payment_id);

-- ============ PAYMENT EVENTS (IDEMPOTENCY) ============
CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  provider_event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error TEXT,
  UNIQUE(provider_event_id)
);

CREATE INDEX idx_payment_events_payment ON payment_events(payment_id);

-- ============ PROMOTIONS ============
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  type VARCHAR(50) NOT NULL,
  status promotion_status NOT NULL DEFAULT 'DRAFT',
  budget INTEGER NOT NULL CHECK (budget >= 0),
  spent INTEGER NOT NULL DEFAULT 0 CHECK (spent >= 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_promotions_provider ON promotions(provider_id);
CREATE INDEX idx_promotions_status ON promotions(status);

-- ============ ADVERTISEMENTS ============
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status advertisement_status NOT NULL DEFAULT 'DRAFT',
  budget INTEGER NOT NULL CHECK (budget >= 0),
  spent INTEGER NOT NULL DEFAULT 0 CHECK (spent >= 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_advertisements_provider ON advertisements(provider_id);
CREATE INDEX idx_advertisements_status ON advertisements(status);

-- ============ PREMIUM SUBSCRIPTIONS ============
CREATE TABLE premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id),
  status premium_status NOT NULL DEFAULT 'ACTIVE',
  plan VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_premium_provider ON premium_subscriptions(provider_id);
CREATE INDEX idx_premium_status ON premium_subscriptions(status);

-- ============ NOTIFICATIONS ============
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============ REVIEWS ============
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(appointment_id)
);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);

-- ============ AUDIT LOGS ============
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(200),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  ip VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============ SYSTEM SETTINGS ============
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- ============ REFRESH TOKENS ============
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
