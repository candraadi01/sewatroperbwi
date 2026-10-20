-- ============================================================
-- Sewa Trooper BWI — Migration 010: Owner Role Assignment & Features Tables
-- ============================================================

-- 1. Pastikan akun owner@sewatrooperbwi.com memiliki role owner
DO $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT id INTO v_owner_id FROM auth.users WHERE email = 'owner@sewatrooperbwi.com' LIMIT 1;
  IF v_owner_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (v_owner_id, 'owner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- 2. Tabel Offline Schedules (Penjadwalan Luar Web / Offline Booking)
CREATE TABLE IF NOT EXISTS offline_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  vehicle_name TEXT NOT NULL DEFAULT 'Jeep Trooper 4x4',
  renter_name TEXT NOT NULL,
  renter_phone TEXT DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT DEFAULT '',
  source TEXT DEFAULT 'offline_direct', -- 'whatsapp', 'call', 'walk_in', 'other'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offline_schedules_owner ON offline_schedules(owner_id);
CREATE INDEX IF NOT EXISTS idx_offline_schedules_dates ON offline_schedules(start_date, end_date);

-- 3. Tabel Payout Requests (Tarik Tunai / Pencairan Saldo Pemilik)
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'transferred'
  admin_notes TEXT DEFAULT '',
  transfer_proof_url TEXT DEFAULT '',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_owner ON payout_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);

-- 4. Tabel User Wishlists (Sukai / Favorit Buyer)
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
