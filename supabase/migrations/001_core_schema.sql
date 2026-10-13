-- ============================================================
-- Sewa Trooper BWI — Migration 001: Core Schema
-- Timestamp DB: UTC. Tampilan UI: Asia/Jakarta.
-- Uang: integer rupiah (tanpa desimal).
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

-- Role aplikasi: hanya buyer dan admin
CREATE TYPE app_role AS ENUM ('buyer', 'admin');

-- Status akun
CREATE TYPE account_status AS ENUM ('active', 'blocked');

-- Jenis layanan produk
CREATE TYPE service_type AS ENUM ('paket_rute', 'harian_sopir', 'harian_lepas_kunci');

-- Status produk
CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive', 'archived');

-- Status booking
CREATE TYPE booking_status AS ENUM (
  'pending_payment',      -- menunggu pembayaran
  'payment_received',     -- pembayaran diterima, menunggu konfirmasi kendaraan
  'confirmed',            -- kendaraan dikonfirmasi
  'in_progress',          -- perjalanan berlangsung
  'completed',            -- selesai
  'cancelled_by_buyer',   -- dibatalkan buyer
  'cancelled_by_admin',   -- dibatalkan admin (kendaraan tidak tersedia, dll)
  'refund_pending',       -- proses refund
  'refunded'              -- refund selesai
);

-- Tujuan pembayaran
CREATE TYPE payment_purpose AS ENUM ('dp', 'full', 'balance', 'additional');

-- Status payment attempt
CREATE TYPE payment_attempt_status AS ENUM (
  'pending', 'authorized', 'captured', 'settlement',
  'deny', 'cancel', 'expire', 'failure', 'refund', 'partial_refund'
);

-- Status refund
CREATE TYPE refund_status AS ENUM (
  'requested', 'approved', 'processing', 'succeeded', 'failed', 'denied'
);

-- Status konten
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- Status notifikasi
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'skipped');

-- ============================================================
-- 1. PROFILES & ROLES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  account_status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'buyer',
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Index untuk query role check
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- ============================================================
-- 2. PRODUK & KATALOG
-- ============================================================

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES product_categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  service_type service_type NOT NULL,
  status product_status NOT NULL DEFAULT 'draft',

  -- Kapasitas: nilai pasti, bukan range
  passenger_capacity INTEGER NOT NULL DEFAULT 6
    CHECK (passenger_capacity > 0 AND passenger_capacity <= 20),
  driver_included BOOLEAN NOT NULL DEFAULT true,

  -- Durasi dalam menit
  duration_minutes INTEGER CHECK (duration_minutes > 0),

  -- Rute
  route_name TEXT DEFAULT '',
  start_point TEXT DEFAULT '',
  end_point TEXT DEFAULT '',
  itinerary JSONB DEFAULT '[]',

  -- Fasilitas
  included_facilities TEXT[] DEFAULT '{}',
  excluded_facilities TEXT[] DEFAULT '{}',

  -- Ketentuan
  terms_version TEXT DEFAULT 'v1',
  terms_content TEXT DEFAULT '',

  -- Booking constraints
  min_booking_hours INTEGER DEFAULT 24,
  max_passengers_per_unit INTEGER CHECK (max_passengers_per_unit > 0),

  -- Overtime
  overtime_rate_per_hour INTEGER DEFAULT 0 CHECK (overtime_rate_per_hour >= 0),

  -- Flags
  is_sample_data BOOLEAN NOT NULL DEFAULT true, -- true = data contoh, bukan tarif owner
  is_owner_approved BOOLEAN NOT NULL DEFAULT false,

  -- SEO
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',

  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_service_type ON products(service_type);
CREATE INDEX idx_products_category ON products(category_id);

-- ============================================================
-- 3. MEDIA
-- ============================================================

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_id TEXT NOT NULL, -- Cloudinary public_id
  version INTEGER,
  format TEXT DEFAULT '',
  resource_type TEXT DEFAULT 'image',
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  alt_text TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  folder TEXT DEFAULT '',
  usage_context TEXT DEFAULT '', -- product, hero, gallery, article, etc.
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_public_id ON media(public_id);
CREATE INDEX idx_media_usage ON media(usage_context);

CREATE TABLE product_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(product_id, media_id)
);

CREATE INDEX idx_product_media_product ON product_media(product_id);

-- ============================================================
-- 4. PRICING
-- ============================================================

CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',

  -- Harga dasar dalam rupiah (integer)
  base_price INTEGER NOT NULL CHECK (base_price >= 0),
  price_unit TEXT NOT NULL DEFAULT 'per_vehicle', -- per_vehicle, per_person

  -- Override tanggal khusus
  date_start DATE,
  date_end DATE,
  CHECK (date_start IS NULL OR date_end IS NULL OR date_start <= date_end),

  -- Hari tertentu (0=Sunday, 6=Saturday)
  applicable_days INTEGER[] DEFAULT NULL,

  -- Prioritas (semakin tinggi = lebih diutamakan)
  priority INTEGER NOT NULL DEFAULT 0,

  is_active BOOLEAN NOT NULL DEFAULT true,
  is_sample_data BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pricing_product ON pricing_rules(product_id);
CREATE INDEX idx_pricing_dates ON pricing_rules(date_start, date_end);

-- Surcharge (tambahan biaya nominal/persen)
CREATE TABLE surcharges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE, -- NULL = berlaku semua
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('nominal', 'percent')),
  value INTEGER NOT NULL CHECK (value >= 0), -- rupiah atau basis points (100 = 1%)
  date_start DATE,
  date_end DATE,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. PICKUP ZONES
-- ============================================================

CREATE TABLE pickup_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  additional_cost INTEGER NOT NULL DEFAULT 0 CHECK (additional_cost >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. EXTRAS (Layanan tambahan)
-- ============================================================

CREATE TABLE extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE, -- NULL = berlaku semua
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. BLACKOUT DATES & SALES QUOTAS
-- ============================================================

CREATE TABLE blackout_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE, -- NULL = semua produk
  date DATE NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, date)
);

CREATE TABLE sales_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  max_units INTEGER NOT NULL DEFAULT 1 CHECK (max_units > 0),
  booked_units INTEGER NOT NULL DEFAULT 0 CHECK (booked_units >= 0),
  -- Catatan: ini kuota penjualan, bukan inventori real-time mitra
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, date)
);

CREATE INDEX idx_sales_quotas_lookup ON sales_quotas(product_id, date);

-- ============================================================
-- 8. PROMOS
-- ============================================================

CREATE TABLE promos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('nominal', 'percent')),
  value INTEGER NOT NULL CHECK (value > 0), -- rupiah atau basis points
  max_discount INTEGER, -- batas maksimum diskon (rupiah)
  min_order_amount INTEGER DEFAULT 0, -- minimum order
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  CHECK (valid_from < valid_until),
  total_quota INTEGER, -- NULL = unlimited
  used_count INTEGER NOT NULL DEFAULT 0,
  per_buyer_limit INTEGER DEFAULT 1,
  applicable_products UUID[] DEFAULT NULL, -- NULL = semua produk
  is_combinable BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_promos_code ON promos(code);
CREATE INDEX idx_promos_validity ON promos(valid_from, valid_until);

-- Reservasi promo per buyer
CREATE TABLE promo_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_id UUID NOT NULL REFERENCES promos(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  booking_id UUID, -- akan di-set saat booking dibuat
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_promo_redemptions_user ON promo_redemptions(user_id, promo_id);

-- ============================================================
-- 9. QUOTES
-- ============================================================

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Pilihan buyer
  service_date DATE NOT NULL,
  start_time TIME,
  duration_minutes INTEGER,
  num_units INTEGER NOT NULL DEFAULT 1 CHECK (num_units > 0),
  num_passengers INTEGER NOT NULL DEFAULT 1 CHECK (num_passengers > 0),
  pickup_zone_id UUID REFERENCES pickup_zones(id),
  pickup_address TEXT DEFAULT '',
  selected_extras UUID[] DEFAULT '{}',

  -- Promo
  promo_id UUID REFERENCES promos(id),
  promo_code TEXT DEFAULT '',

  -- Kalkulasi server (immutable snapshot)
  base_price INTEGER NOT NULL CHECK (base_price >= 0),
  extras_total INTEGER NOT NULL DEFAULT 0 CHECK (extras_total >= 0),
  pickup_cost INTEGER NOT NULL DEFAULT 0 CHECK (pickup_cost >= 0),
  surcharge_total INTEGER NOT NULL DEFAULT 0 CHECK (surcharge_total >= 0),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  dp_amount INTEGER NOT NULL DEFAULT 0 CHECK (dp_amount >= 0),
  dp_percentage INTEGER NOT NULL DEFAULT 3000, -- basis points (3000 = 30%)

  -- Validitas
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  
  -- Snapshot data
  price_snapshot JSONB NOT NULL DEFAULT '{}',
  terms_snapshot JSONB NOT NULL DEFAULT '{}',
  product_snapshot JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotes_user ON quotes(user_id);
CREATE INDEX idx_quotes_expires ON quotes(expires_at);

-- ============================================================
-- 10. BOOKINGS
-- ============================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code TEXT NOT NULL UNIQUE, -- Human-readable: TRP-20261013-XXXX
  user_id UUID NOT NULL REFERENCES profiles(id),
  quote_id UUID NOT NULL REFERENCES quotes(id),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Detail perjalanan (dari quote, immutable)
  service_date DATE NOT NULL,
  start_time TIME,
  duration_minutes INTEGER,
  num_units INTEGER NOT NULL DEFAULT 1,
  num_passengers INTEGER NOT NULL DEFAULT 1,
  pickup_zone_id UUID REFERENCES pickup_zones(id),
  pickup_address TEXT DEFAULT '',

  -- Kontak buyer
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT DEFAULT '',
  notes TEXT DEFAULT '',

  -- Keuangan (snapshot dari quote)
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  dp_amount INTEGER NOT NULL DEFAULT 0 CHECK (dp_amount >= 0),
  amount_paid INTEGER NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  outstanding INTEGER NOT NULL DEFAULT 0 CHECK (outstanding >= 0),

  -- Pilihan pembayaran
  payment_choice payment_purpose NOT NULL, -- dp atau full

  -- Status
  status booking_status NOT NULL DEFAULT 'pending_payment',

  -- Persetujuan buyer
  terms_version TEXT NOT NULL,
  terms_accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Promo
  promo_id UUID REFERENCES promos(id),
  promo_code TEXT DEFAULT '',

  -- Snapshots (immutable)
  price_snapshot JSONB NOT NULL DEFAULT '{}',
  terms_snapshot JSONB NOT NULL DEFAULT '{}',
  product_snapshot JSONB NOT NULL DEFAULT '{}',

  -- Admin
  admin_notes TEXT DEFAULT '',
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id),
  confirmation_deadline TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_code ON bookings(booking_code);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(service_date);
CREATE INDEX idx_bookings_product ON bookings(product_id);

-- Booking items (extras yang dipilih)
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'extra', 'surcharge', 'pickup'
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_items_booking ON booking_items(booking_id);

-- Status history
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status booking_status,
  new_status booking_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_status_history ON booking_status_history(booking_id);

-- ============================================================
-- 11. PAYMENTS
-- ============================================================

CREATE TABLE payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  
  -- Midtrans
  midtrans_order_id TEXT NOT NULL UNIQUE,
  midtrans_transaction_id TEXT,
  
  -- Purpose
  purpose payment_purpose NOT NULL,
  expected_amount INTEGER NOT NULL CHECK (expected_amount > 0),
  paid_amount INTEGER DEFAULT 0,
  
  -- Status
  status payment_attempt_status NOT NULL DEFAULT 'pending',
  fraud_status TEXT DEFAULT '',
  payment_type TEXT DEFAULT '',
  
  -- Idempotency
  idempotency_key TEXT NOT NULL UNIQUE,
  
  -- Provider data
  snap_token TEXT,
  snap_redirect_url TEXT,
  provider_response JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_attempts_booking ON payment_attempts(booking_id);
CREATE INDEX idx_payment_attempts_order ON payment_attempts(midtrans_order_id);
CREATE INDEX idx_payment_attempts_status ON payment_attempts(status);

-- Payment ledger (catatan pembayaran masuk/keluar)
CREATE TABLE payment_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  payment_attempt_id UUID REFERENCES payment_attempts(id),
  refund_id UUID, -- akan reference refunds table
  
  entry_type TEXT NOT NULL CHECK (entry_type IN ('payment', 'refund')),
  amount INTEGER NOT NULL, -- positif untuk payment, negatif untuk refund
  balance_after INTEGER NOT NULL, -- saldo setelah entry
  
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_ledger_booking ON payment_ledger(booking_id);

-- Webhook events inbox
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'midtrans',
  event_id TEXT NOT NULL, -- Midtrans: order_id + transaction_status + status_code
  order_id TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  signature_valid BOOLEAN,
  processed BOOLEAN NOT NULL DEFAULT false,
  process_result TEXT DEFAULT '',
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE(provider, event_id)
);

CREATE INDEX idx_webhook_events_order ON webhook_events(order_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);

-- Refunds
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  payment_attempt_id UUID REFERENCES payment_attempts(id),
  
  amount INTEGER NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  status refund_status NOT NULL DEFAULT 'requested',
  
  -- Midtrans refund
  midtrans_refund_id TEXT,
  provider_response JSONB DEFAULT '{}',
  
  -- Authorization
  requested_by UUID NOT NULL REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  
  idempotency_key TEXT NOT NULL UNIQUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_ledger ADD CONSTRAINT fk_ledger_refund 
  FOREIGN KEY (refund_id) REFERENCES refunds(id);

CREATE INDEX idx_refunds_booking ON refunds(booking_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  invoice_number TEXT NOT NULL UNIQUE, -- INV-20261013-XXXX
  
  items JSONB NOT NULL DEFAULT '[]',
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  outstanding INTEGER NOT NULL DEFAULT 0,
  
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_booking ON invoices(booking_id);

-- ============================================================
-- 12. CHANGE / CANCELLATION REQUESTS
-- ============================================================

CREATE TABLE change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('reschedule', 'cancel', 'modify')),
  
  requested_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL DEFAULT '',
  
  -- Perubahan yang diminta
  requested_changes JSONB DEFAULT '{}',
  
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  
  reviewed_by UUID REFERENCES profiles(id),
  review_notes TEXT DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_change_requests_booking ON change_requests(booking_id);

-- ============================================================
-- 13. CMS / SITE SETTINGS
-- ============================================================

-- Site settings (key-value terstruktur)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general', -- general, business, appearance, etc.
  description TEXT DEFAULT '',
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE INDEX idx_site_settings_category ON site_settings(category);

-- Pages (halaman CMS)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]', -- structured blocks
  status content_status NOT NULL DEFAULT 'draft',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page revisions
CREATE TABLE page_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_summary TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_revisions_page ON page_revisions(page_id);

-- Landing page sections
CREATE TABLE landing_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type TEXT NOT NULL, -- hero, categories, featured, howto, faq, articles, contact
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_landing_sections_type ON landing_sections(section_type);

-- FAQ
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'umum',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menus
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL, -- header, footer
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 14. ARTICLES
-- ============================================================

CREATE TABLE article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES article_categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content JSONB NOT NULL DEFAULT '[]', -- structured blocks, sanitized
  cover_image_id UUID REFERENCES media(id),
  status content_status NOT NULL DEFAULT 'draft',
  
  -- SEO
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  
  -- Scheduling
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published ON articles(published_at);

-- ============================================================
-- 15. NOTIFICATIONS
-- ============================================================

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL DEFAULT 'in_app', -- in_app, email, whatsapp
  subject TEXT DEFAULT '',
  body_template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_outbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES notification_templates(id),
  recipient_id UUID REFERENCES profiles(id),
  channel TEXT NOT NULL DEFAULT 'in_app',
  subject TEXT DEFAULT '',
  body TEXT NOT NULL,
  
  -- In-app
  is_read BOOLEAN NOT NULL DEFAULT false,
  
  -- Delivery
  status notification_status NOT NULL DEFAULT 'pending',
  provider_response JSONB DEFAULT '{}',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_recipient ON notification_outbox(recipient_id);
CREATE INDEX idx_notifications_status ON notification_outbox(status);
CREATE INDEX idx_notifications_unread ON notification_outbox(recipient_id, is_read) WHERE is_read = false;

-- ============================================================
-- 16. AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB DEFAULT NULL,
  new_data JSONB DEFAULT NULL,
  ip_address INET,
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- 17. BUSINESS SETTINGS (Versioned)
-- ============================================================

CREATE TABLE business_settings_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version INTEGER NOT NULL,
  
  -- DP
  default_dp_percentage INTEGER NOT NULL DEFAULT 3000, -- basis points (3000 = 30%)
  dp_mode TEXT NOT NULL DEFAULT 'percent' CHECK (dp_mode IN ('percent', 'nominal')),
  dp_basis TEXT NOT NULL DEFAULT 'per_order' CHECK (dp_basis IN ('per_order', 'per_unit')),
  
  -- Batas waktu
  confirmation_deadline_hours INTEGER NOT NULL DEFAULT 24,
  balance_payment_deadline_hours INTEGER NOT NULL DEFAULT 24,
  
  -- Durasi harian
  daily_duration_hours INTEGER NOT NULL DEFAULT 12,
  
  -- Penjemputan
  default_pickup_included BOOLEAN NOT NULL DEFAULT false,
  
  -- Kebijakan
  cancellation_policy TEXT NOT NULL DEFAULT '',
  refund_policy TEXT NOT NULL DEFAULT '',
  terms_and_conditions TEXT NOT NULL DEFAULT '',
  privacy_policy TEXT NOT NULL DEFAULT '',
  
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(version)
);

-- ============================================================
-- 18. JOB PROCESSING
-- ============================================================

CREATE TABLE job_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT DEFAULT '',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_records_status ON job_records(status);
CREATE INDEX idx_job_records_type ON job_records(job_type);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payment_attempts_updated_at BEFORE UPDATE ON payment_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_promos_updated_at BEFORE UPDATE ON promos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_refunds_updated_at BEFORE UPDATE ON refunds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Default role: buyer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Check if user has role (safe from RLS recursion)
CREATE OR REPLACE FUNCTION has_role(check_user_id UUID, check_role app_role)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = check_role
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Revoke direct execute from public, grant only to authenticated
REVOKE EXECUTE ON FUNCTION has_role FROM PUBLIC;
GRANT EXECUTE ON FUNCTION has_role TO authenticated;

-- Generate booking code
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  date_part TEXT;
  random_part TEXT;
  result TEXT;
BEGIN
  date_part := to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD');
  random_part := upper(substring(md5(random()::text) from 1 for 4));
  result := 'TRP-' || date_part || '-' || random_part;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM bookings WHERE booking_code = result) LOOP
    random_part := upper(substring(md5(random()::text) from 1 for 4));
    result := 'TRP-' || date_part || '-' || random_part;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  date_part TEXT;
  seq INTEGER;
  result TEXT;
BEGIN
  date_part := to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD');
  SELECT COALESCE(MAX(
    CAST(substring(invoice_number from 'INV-' || date_part || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO seq
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || date_part || '-%';
  
  result := 'INV-' || date_part || '-' || lpad(seq::text, 4, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;
