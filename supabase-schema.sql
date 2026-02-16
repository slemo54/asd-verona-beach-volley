-- ============================================
-- ASD Verona Beach Volley — Complete Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'athlete' CHECK (role IN ('athlete', 'admin')),
  tshirt_size VARCHAR(5) CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  avatar_url TEXT,
  is_moroso BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- GROUPS
-- ============================================
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  coach_id UUID REFERENCES profiles(id),
  macro_category VARCHAR(10) NOT NULL CHECK (macro_category IN ('male', 'female')),
  level VARCHAR(10) NOT NULL CHECK (level IN ('base', 'medium', 'pro')),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('18:30-20:00', '20:00-21:30')),
  max_athletes SMALLINT NOT NULL DEFAULT 12,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- GROUP ATHLETES (junction table)
-- ============================================
CREATE TABLE group_athletes (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(group_id, athlete_id)
);

CREATE INDEX idx_group_athletes_group ON group_athletes(group_id) WHERE is_active = TRUE;
CREATE INDEX idx_group_athletes_athlete ON group_athletes(athlete_id) WHERE is_active = TRUE;

-- ============================================
-- MEDICAL CERTIFICATES
-- ============================================
CREATE TABLE medical_certificates (
  id SERIAL PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('agonistico', 'non_agonistico')),
  expiry_date DATE NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring', 'expired'))
);

CREATE INDEX idx_certificates_athlete ON medical_certificates(athlete_id);
CREATE INDEX idx_certificates_expiry ON medical_certificates(expiry_date);

-- ============================================
-- TRAINING SESSIONS
-- ============================================
CREATE TABLE training_sessions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('18:30-20:00', '20:00-21:30')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, session_date)
);

CREATE INDEX idx_sessions_date ON training_sessions(session_date);
CREATE INDEX idx_sessions_group ON training_sessions(group_id);

-- ============================================
-- ATTENDANCES
-- ============================================
CREATE TABLE attendances (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_present BOOLEAN NOT NULL,
  needs_recovery BOOLEAN NOT NULL DEFAULT FALSE,
  recovery_date DATE,
  recovery_group_id INTEGER REFERENCES groups(id),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, athlete_id)
);

CREATE INDEX idx_attendances_athlete ON attendances(athlete_id);
CREATE INDEX idx_attendances_session ON attendances(session_id);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  season VARCHAR(20) NOT NULL,
  total_season_fee DECIMAL(8,2) NOT NULL,
  association_fee DECIMAL(8,2) NOT NULL DEFAULT 15.00,
  amount_paid DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  balance_due DECIMAL(8,2) GENERATED ALWAYS AS (total_season_fee + association_fee - amount_paid) STORED,
  payment_method VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'overdue' CHECK (status IN ('paid', 'partial', 'overdue')),
  last_payment_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(athlete_id, season)
);

CREATE INDEX idx_payments_athlete ON payments(athlete_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- PAYMENT TRANSACTIONS
-- ============================================
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount DECIMAL(8,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID REFERENCES profiles(id),
  notes TEXT
);

-- ============================================
-- COURT BOOKINGS
-- ============================================
CREATE TABLE court_bookings (
  id SERIAL PRIMARY KEY,
  court_name VARCHAR(100) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  booked_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(court_name, booking_date, time_slot)
);

CREATE INDEX idx_bookings_date ON court_bookings(booking_date);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(8,2) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('tshirt', 'sweatshirt', 'accessory', 'other')),
  available_sizes JSONB DEFAULT '[]'::jsonb,
  image_urls JSONB DEFAULT '[]'::jsonb,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(8,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_athlete ON orders(athlete_id);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity SMALLINT NOT NULL DEFAULT 1,
  size VARCHAR(10),
  unit_price DECIMAL(8,2) NOT NULL
);

-- ============================================
-- PROMOTIONS
-- ============================================
CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  partner_name VARCHAR(200),
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(8,2),
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ADMIN LOGS
-- ============================================
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_date ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update payment status based on amount_paid
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount_paid >= (NEW.total_season_fee + NEW.association_fee) THEN
    NEW.status = 'paid';
  ELSIF NEW.amount_paid > 0 THEN
    NEW.status = 'partial';
  ELSE
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_status_update BEFORE INSERT OR UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_payment_status();

-- Auto-update is_moroso on profiles when payment changes
CREATE OR REPLACE FUNCTION sync_morosity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET is_moroso = (
    EXISTS (
      SELECT 1 FROM payments
      WHERE athlete_id = NEW.athlete_id
      AND status = 'overdue'
    )
  ) WHERE id = NEW.athlete_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_sync_morosity AFTER INSERT OR UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION sync_morosity();
