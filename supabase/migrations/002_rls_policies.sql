-- ============================================================
-- Sewa Trooper BWI — Migration 002: Row Level Security
-- ============================================================
-- Prinsip:
-- 1. Public: baca konten published dan katalog publik
-- 2. Buyer: baca/update profil sendiri, baca pesanan/tagihan sendiri
-- 3. Admin: akses penuh melalui has_role()
-- 4. Buyer TIDAK BISA ubah role, harga, status pembayaran, refund
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE surcharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_records ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================

-- Public: baca nama & avatar (untuk tampilan)
CREATE POLICY profiles_public_read ON profiles
  FOR SELECT TO anon, authenticated
  USING (true);

-- Buyer: update profil sendiri (HANYA kolom tertentu, bukan role/status)
CREATE POLICY profiles_owner_update ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin: full access
CREATE POLICY profiles_admin_all ON profiles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- USER ROLES (sangat terlindungi)
-- ============================================================

-- Buyer bisa baca role sendiri
CREATE POLICY roles_owner_read ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Hanya admin yang bisa mengelola roles
CREATE POLICY roles_admin_all ON user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- PRODUCT CATEGORIES (publik baca, admin kelola)
-- ============================================================

CREATE POLICY categories_public_read ON product_categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY categories_admin_all ON product_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- PRODUCTS (publik baca active, admin kelola semua)
-- ============================================================

CREATE POLICY products_public_read ON products
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY products_admin_all ON products
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- MEDIA (publik baca, admin kelola)
-- ============================================================

CREATE POLICY media_public_read ON media
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY media_admin_all ON media
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY product_media_public_read ON product_media
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY product_media_admin_all ON product_media
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- PRICING (publik baca active, admin kelola)
-- ============================================================

CREATE POLICY pricing_public_read ON pricing_rules
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY pricing_admin_all ON pricing_rules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY surcharges_public_read ON surcharges
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY surcharges_admin_all ON surcharges
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- PICKUP ZONES (publik baca, admin kelola)
-- ============================================================

CREATE POLICY pickup_public_read ON pickup_zones
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY pickup_admin_all ON pickup_zones
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- EXTRAS (publik baca, admin kelola)
-- ============================================================

CREATE POLICY extras_public_read ON extras
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY extras_admin_all ON extras
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- BLACKOUT DATES (publik baca, admin kelola)
-- ============================================================

CREATE POLICY blackout_public_read ON blackout_dates
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY blackout_admin_all ON blackout_dates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- SALES QUOTAS (publik baca, admin kelola)
-- ============================================================

CREATE POLICY quotas_public_read ON sales_quotas
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY quotas_admin_all ON sales_quotas
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- PROMOS (publik baca active, admin kelola)
-- ============================================================

CREATE POLICY promos_public_read ON promos
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND now() BETWEEN valid_from AND valid_until);

CREATE POLICY promos_admin_all ON promos
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY promo_redemptions_owner_read ON promo_redemptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY promo_redemptions_admin_all ON promo_redemptions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- QUOTES (owner baca, admin kelola)
-- ============================================================

CREATE POLICY quotes_owner_read ON quotes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY quotes_owner_insert ON quotes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY quotes_admin_all ON quotes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- BOOKINGS (owner baca, admin kelola)
-- Buyer TIDAK bisa update harga, status, DP, dll
-- ============================================================

CREATE POLICY bookings_owner_read ON bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Buyer hanya bisa INSERT melalui server action/RPC
CREATE POLICY bookings_owner_insert ON bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY bookings_admin_all ON bookings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Booking items: mengikuti booking ownership
CREATE POLICY booking_items_owner_read ON booking_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_items.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY booking_items_admin_all ON booking_items
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Status history: mengikuti booking ownership
CREATE POLICY status_history_owner_read ON booking_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_status_history.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY status_history_admin_all ON booking_status_history
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- PAYMENTS (owner baca, admin kelola)
-- Buyer TIDAK bisa ubah status pembayaran
-- ============================================================

CREATE POLICY payments_owner_read ON payment_attempts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payment_attempts.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY payments_admin_all ON payment_attempts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Payment ledger: owner baca
CREATE POLICY ledger_owner_read ON payment_ledger
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payment_ledger.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY ledger_admin_all ON payment_ledger
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Webhook events: admin only
CREATE POLICY webhook_admin_only ON webhook_events
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Refunds: owner baca status
CREATE POLICY refunds_owner_read ON refunds
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = refunds.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY refunds_admin_all ON refunds
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Invoices: owner baca
CREATE POLICY invoices_owner_read ON invoices
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = invoices.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY invoices_admin_all ON invoices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- CHANGE REQUESTS (owner baca/insert, admin kelola)
-- ============================================================

CREATE POLICY change_requests_owner_read ON change_requests
  FOR SELECT TO authenticated
  USING (requested_by = auth.uid());

CREATE POLICY change_requests_owner_insert ON change_requests
  FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY change_requests_admin_all ON change_requests
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- CMS / SITE SETTINGS
-- ============================================================

-- Site settings: publik baca (non-secret), admin kelola
CREATE POLICY settings_public_read ON site_settings
  FOR SELECT TO anon, authenticated
  USING (category != 'secret');

CREATE POLICY settings_admin_all ON site_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Pages: publik baca published
CREATE POLICY pages_public_read ON pages
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY pages_admin_all ON pages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY page_revisions_admin_all ON page_revisions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Landing sections: publik baca active
CREATE POLICY landing_public_read ON landing_sections
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY landing_admin_all ON landing_sections
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- FAQ: publik baca active
CREATE POLICY faq_public_read ON faqs
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY faq_admin_all ON faqs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Menus: publik baca
CREATE POLICY menus_public_read ON menus
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY menus_admin_all ON menus
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- ARTICLES
-- ============================================================

CREATE POLICY article_categories_public_read ON article_categories
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY article_categories_admin_all ON article_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY articles_public_read ON articles
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND published_at <= now());

CREATE POLICY articles_admin_all ON articles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- NOTIFICATIONS (owner baca sendiri, admin kelola)
-- ============================================================

CREATE POLICY notification_templates_admin_all ON notification_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY notifications_owner_read ON notification_outbox
  FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY notifications_owner_update ON notification_outbox
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY notifications_admin_all ON notification_outbox
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- AUDIT LOGS (admin only)
-- ============================================================

CREATE POLICY audit_admin_only ON audit_logs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- BUSINESS SETTINGS (publik baca current, admin kelola)
-- ============================================================

CREATE POLICY business_settings_public_read ON business_settings_versions
  FOR SELECT TO anon, authenticated
  USING (is_current = true);

CREATE POLICY business_settings_admin_all ON business_settings_versions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- JOB RECORDS (admin only)
-- ============================================================

CREATE POLICY jobs_admin_only ON job_records
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));
