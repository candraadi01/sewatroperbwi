-- ============================================================
-- Sewa Trooper BWI — Migration 003: Seed Data (Development Only)
-- PERHATIAN: Data ini adalah contoh untuk development/sandbox.
-- BUKAN tarif resmi usaha. Semua produk ditandai is_sample_data = true.
-- ============================================================

-- ============================================================
-- PRODUCT CATEGORIES
-- ============================================================

INSERT INTO product_categories (id, name, slug, description, sort_order, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Paket Rute Wisata', 'paket-rute', 'Paket wisata dengan rute terencana dan sopir berpengalaman', 1, true),
  ('a1000000-0000-0000-0000-000000000002', 'Sewa Harian + Sopir', 'harian-sopir', 'Sewa kendaraan harian dengan sopir untuk fleksibilitas perjalanan', 2, true),
  ('a1000000-0000-0000-0000-000000000003', 'Sewa Lepas Kunci', 'lepas-kunci', 'Sewa kendaraan tanpa sopir dengan syarat dan ketentuan berlaku', 3, true);

-- ============================================================
-- PRODUCTS — Paket Rute (seed data contoh)
-- Sumber referensi: https://jalanjalandibanyuwangi.com/sewa-mobil-jeep-banyuwangi/
-- Harga, identitas, dan foto BUKAN milik referensi.
-- ============================================================

INSERT INTO products (id, category_id, name, slug, description, short_description, service_type, status,
  passenger_capacity, driver_included, duration_minutes, route_name, start_point, end_point,
  included_facilities, excluded_facilities, terms_version, terms_content,
  min_booking_hours, overtime_rate_per_hour, is_sample_data, is_owner_approved, sort_order) VALUES

-- Baluran
('b1000000-0000-0000-0000-000000000001',
 'a1000000-0000-0000-0000-000000000001',
 'Paket Taman Nasional Baluran',
 'baluran',
 'Jelajahi "Afrika-nya Jawa" di Taman Nasional Baluran. Savana Bekol yang luas, pantai Bama, dan kesempatan melihat satwa liar dalam habitat aslinya. Perjalanan sekitar 5 jam dari titik keberangkatan di area Banyuwangi.',
 'Savana Bekol, Pantai Bama, dan satwa liar Baluran',
 'paket_rute', 'draft',
 6, true, 300, 'Baluran', 'Area Banyuwangi (detail penjemputan saat booking)', 'Kembali ke titik jemput',
 ARRAY['Kendaraan Jeep Trooper', 'Sopir berpengalaman', 'BBM selama rute'],
 ARRAY['Tiket masuk Taman Nasional', 'Makanan dan minuman', 'Pemandu wisata lokal', 'Asuransi perjalanan pribadi'],
 'v1',
 'Ketentuan paket rute wisata Baluran. Harga belum disetujui owner.',
 24, 0, true, false, 1),

-- Kawah Ijen
('b1000000-0000-0000-0000-000000000002',
 'a1000000-0000-0000-0000-000000000001',
 'Paket Kawah Ijen',
 'kawah-ijen',
 'Pendakian ke Kawah Ijen untuk menyaksikan fenomena blue fire dan panorama kawah belerang terbesar di Pulau Jawa. Keberangkatan dini hari dari area Banyuwangi, durasi perjalanan sekitar 8 jam.',
 'Blue fire, kawah belerang, dan sunrise Ijen',
 'paket_rute', 'draft',
 6, true, 480, 'Kawah Ijen', 'Area Banyuwangi (detail penjemputan saat booking)', 'Kembali ke titik jemput',
 ARRAY['Kendaraan Jeep Trooper', 'Sopir berpengalaman', 'BBM selama rute'],
 ARRAY['Tiket masuk Kawah Ijen', 'Masker gas', 'Makanan dan minuman', 'Pemandu wisata/porter', 'Asuransi perjalanan pribadi'],
 'v1',
 'Ketentuan paket rute wisata Kawah Ijen. Harga belum disetujui owner.',
 24, 0, true, false, 2),

-- Kawah Wurung
('b1000000-0000-0000-0000-000000000003',
 'a1000000-0000-0000-0000-000000000001',
 'Paket Kawah Wurung',
 'kawah-wurung',
 'Kunjungi Kawah Wurung, kawah mati yang kini menjadi hamparan hijau nan indah. Lokasi ini cocok untuk fotografi dan menikmati ketenangan alam. Durasi perjalanan sekitar 8 jam.',
 'Hamparan hijau kawah mati yang menakjubkan',
 'paket_rute', 'draft',
 6, true, 480, 'Kawah Wurung', 'Area Banyuwangi (detail penjemputan saat booking)', 'Kembali ke titik jemput',
 ARRAY['Kendaraan Jeep Trooper', 'Sopir berpengalaman', 'BBM selama rute'],
 ARRAY['Tiket masuk', 'Makanan dan minuman', 'Pemandu wisata', 'Asuransi perjalanan pribadi'],
 'v1',
 'Ketentuan paket rute wisata Kawah Wurung. Harga belum disetujui owner.',
 24, 0, true, false, 3),

-- De Djawatan
('b1000000-0000-0000-0000-000000000004',
 'a1000000-0000-0000-0000-000000000001',
 'Paket De Djawatan',
 'de-djawatan',
 'Hutan trembesi ikonik De Djawatan di Benculuk. Suasana magis dengan pohon-pohon raksasa yang menciptakan kanopi alami. Durasi perjalanan sekitar 5 jam.',
 'Hutan trembesi magis bak negeri dongeng',
 'paket_rute', 'draft',
 6, true, 300, 'De Djawatan', 'Area Banyuwangi (detail penjemputan saat booking)', 'Kembali ke titik jemput',
 ARRAY['Kendaraan Jeep Trooper', 'Sopir berpengalaman', 'BBM selama rute'],
 ARRAY['Tiket masuk', 'Makanan dan minuman', 'Pemandu wisata', 'Asuransi perjalanan pribadi'],
 'v1',
 'Ketentuan paket rute wisata De Djawatan. Harga belum disetujui owner.',
 24, 0, true, false, 4),

-- Djawatan + Baluran
('b1000000-0000-0000-0000-000000000005',
 'a1000000-0000-0000-0000-000000000001',
 'Paket Djawatan & Baluran',
 'djawatan-baluran',
 'Paket kombinasi dua destinasi populer: hutan trembesi De Djawatan dan savana Taman Nasional Baluran dalam satu hari penuh. Durasi sekitar 12 jam.',
 'Dua destinasi populer dalam satu perjalanan',
 'paket_rute', 'draft',
 6, true, 720, 'Djawatan & Baluran', 'Area Banyuwangi (detail penjemputan saat booking)', 'Kembali ke titik jemput',
 ARRAY['Kendaraan Jeep Trooper', 'Sopir berpengalaman', 'BBM selama rute'],
 ARRAY['Tiket masuk destinasi', 'Makanan dan minuman', 'Pemandu wisata', 'Asuransi perjalanan pribadi'],
 'v1',
 'Ketentuan paket kombinasi Djawatan & Baluran. Harga belum disetujui owner.',
 24, 0, true, false, 5),

-- Ijen + Kawah Wurung
('b1000000-0000-0000-0000-000000000006',
 'a1000000-0000-0000-0000-000000000001',
 'Paket Ijen & Kawah Wurung',
 'ijen-kawah-wurung',
 'Paket dua kawah dalam satu perjalanan: Kawah Ijen dengan blue fire-nya dan Kawah Wurung dengan hamparan hijaunya. Durasi sekitar 12 jam.',
 'Dua kawah spektakuler dalam satu hari',
 'paket_rute', 'draft',
 6, true, 720, 'Ijen & Kawah Wurung', 'Area Banyuwangi (detail penjemputan saat booking)', 'Kembali ke titik jemput',
 ARRAY['Kendaraan Jeep Trooper', 'Sopir berpengalaman', 'BBM selama rute'],
 ARRAY['Tiket masuk destinasi', 'Masker gas Ijen', 'Makanan dan minuman', 'Pemandu/porter', 'Asuransi perjalanan pribadi'],
 'v1',
 'Ketentuan paket kombinasi Ijen & Kawah Wurung. Harga belum disetujui owner.',
 24, 0, true, false, 6),

-- Ijen + Djawatan
('b1000000-0000-0000-0000-000000000007',
 'a1000000-0000-0000-0000-000000000001',
 'Paket Ijen & Djawatan',
 'ijen-djawatan',
 'Kombinasi pendakian Kawah Ijen dan jelajah hutan De Djawatan dalam perjalanan satu hari penuh. Durasi sekitar 12 jam.',
 'Blue fire Ijen dan hutan magis Djawatan',
 'paket_rute', 'draft',
 6, true, 720, 'Ijen & Djawatan', 'Area Banyuwangi (detail penjemputan saat booking)', 'Kembali ke titik jemput',
 ARRAY['Kendaraan Jeep Trooper', 'Sopir berpengalaman', 'BBM selama rute'],
 ARRAY['Tiket masuk destinasi', 'Masker gas Ijen', 'Makanan dan minuman', 'Pemandu/porter', 'Asuransi perjalanan pribadi'],
 'v1',
 'Ketentuan paket kombinasi Ijen & Djawatan. Harga belum disetujui owner.',
 24, 0, true, false, 7),

-- Ijen + Baluran
('b1000000-0000-0000-0000-000000000008',
 'a1000000-0000-0000-0000-000000000001',
 'Paket Ijen & Baluran',
 'ijen-baluran',
 'Dua ikon wisata Banyuwangi: pendakian Kawah Ijen di pagi hari dilanjutkan safari Taman Nasional Baluran. Durasi sekitar 12 jam.',
 'Kawah Ijen dan safari Baluran satu hari',
 'paket_rute', 'draft',
 6, true, 720, 'Ijen & Baluran', 'Area Banyuwangi (detail penjemputan saat booking)', 'Kembali ke titik jemput',
 ARRAY['Kendaraan Jeep Trooper', 'Sopir berpengalaman', 'BBM selama rute'],
 ARRAY['Tiket masuk destinasi', 'Masker gas Ijen', 'Makanan dan minuman', 'Pemandu/porter', 'Asuransi perjalanan pribadi'],
 'v1',
 'Ketentuan paket kombinasi Ijen & Baluran. Harga belum disetujui owner.',
 24, 0, true, false, 8);

-- ============================================================
-- PRODUCTS — Harian (draft, belum ada harga/ketentuan owner)
-- ============================================================

INSERT INTO products (id, category_id, name, slug, description, short_description, service_type, status,
  passenger_capacity, driver_included, duration_minutes,
  included_facilities, excluded_facilities, terms_version,
  is_sample_data, is_owner_approved, sort_order) VALUES

('b2000000-0000-0000-0000-000000000001',
 'a1000000-0000-0000-0000-000000000002',
 'Sewa Harian Trooper + Sopir',
 'harian-sopir',
 'Sewa Jeep Trooper harian dengan sopir berpengalaman. Area layanan Banyuwangi dan sekitarnya. Batas area dan durasi sesuai ketentuan yang berlaku.',
 'Jelajahi Banyuwangi seharian dengan sopir',
 'harian_sopir', 'draft',
 6, true, 720,
 ARRAY['Kendaraan Jeep Trooper', 'Sopir berpengalaman', 'BBM sesuai ketentuan'],
 ARRAY['Tol', 'Parkir', 'Makanan sopir di luar area', 'Tiket wisata'],
 'v1',
 true, false, 1),

('b3000000-0000-0000-0000-000000000001',
 'a1000000-0000-0000-0000-000000000003',
 'Sewa Lepas Kunci Trooper',
 'lepas-kunci',
 'Sewa Jeep Trooper tanpa sopir. Syarat dan ketentuan khusus berlaku. Hubungi admin untuk informasi lebih lanjut.',
 'Kendaraan tanpa sopir, syarat berlaku',
 'harian_lepas_kunci', 'draft',
 6, false, 720,
 ARRAY['Kendaraan Jeep Trooper', 'BBM kondisi terisi'],
 ARRAY['BBM selama pemakaian', 'Tol', 'Parkir'],
 'v1',
 true, false, 1);

-- ============================================================
-- PRICING RULES — Paket Rute (harga referensi, BUKAN tarif resmi)
-- Semua ditandai is_sample_data = true
-- ============================================================

INSERT INTO pricing_rules (product_id, name, base_price, price_unit, is_active, is_sample_data) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Harga Referensi Baluran', 550000, 'per_vehicle', true, true),
  ('b1000000-0000-0000-0000-000000000002', 'Harga Referensi Kawah Ijen', 550000, 'per_vehicle', true, true),
  ('b1000000-0000-0000-0000-000000000003', 'Harga Referensi Kawah Wurung', 800000, 'per_vehicle', true, true),
  ('b1000000-0000-0000-0000-000000000004', 'Harga Referensi De Djawatan', 550000, 'per_vehicle', true, true),
  ('b1000000-0000-0000-0000-000000000005', 'Harga Referensi Djawatan & Baluran', 900000, 'per_vehicle', true, true),
  ('b1000000-0000-0000-0000-000000000006', 'Harga Referensi Ijen & Kawah Wurung', 950000, 'per_vehicle', true, true),
  ('b1000000-0000-0000-0000-000000000007', 'Harga Referensi Ijen & Djawatan', 950000, 'per_vehicle', true, true),
  ('b1000000-0000-0000-0000-000000000008', 'Harga Referensi Ijen & Baluran', 950000, 'per_vehicle', true, true);

-- Catatan: Produk harian/lepas kunci TIDAK memiliki pricing rule
-- karena harga dan ketentuan belum disetujui owner.

-- ============================================================
-- PICKUP ZONES (contoh)
-- ============================================================

INSERT INTO pickup_zones (name, description, additional_cost, is_active, sort_order) VALUES
  ('Kota Banyuwangi', 'Area dalam kota Banyuwangi', 0, true, 1),
  ('Stasiun Banyuwangi Baru', 'Penjemputan di stasiun kereta', 0, true, 2),
  ('Pelabuhan Ketapang', 'Penjemputan di pelabuhan feri', 50000, true, 3),
  ('Bandara Blimbingsari', 'Penjemputan di bandara Banyuwangi', 50000, true, 4);

-- ============================================================
-- BUSINESS SETTINGS — Versi awal (placeholder)
-- ============================================================

INSERT INTO business_settings_versions (version, default_dp_percentage, dp_mode, dp_basis,
  confirmation_deadline_hours, balance_payment_deadline_hours, daily_duration_hours,
  default_pickup_included, cancellation_policy, refund_policy, terms_and_conditions,
  privacy_policy, is_current) VALUES
(1, 3000, 'percent', 'per_order', 24, 24, 12, false,
 'Kebijakan pembatalan akan ditentukan oleh owner. Placeholder.',
 'Kebijakan refund akan ditentukan oleh owner. Placeholder.',
 'Syarat dan ketentuan akan ditentukan oleh owner. Placeholder.',
 'Kebijakan privasi akan ditentukan oleh owner. Placeholder.',
 true);

-- ============================================================
-- FAQ
-- ============================================================

INSERT INTO faqs (question, answer, category, sort_order, is_active) VALUES
  ('Apa saja yang termasuk dalam paket wisata?', 'Setiap paket mencakup kendaraan Jeep Trooper dan sopir berpengalaman. Tiket masuk destinasi, pemandu wisata, dan makanan umumnya tidak termasuk kecuali disebutkan secara khusus pada detail produk.', 'umum', 1, true),
  ('Berapa kapasitas Jeep Trooper?', 'Kapasitas penumpang tertera pada setiap produk. Jumlah pasti dan apakah sopir dihitung dalam kapasitas akan dijelaskan di detail layanan.', 'kendaraan', 2, true),
  ('Bagaimana sistem pembayaran?', 'Anda dapat membayar DP (uang muka) atau langsung lunas saat booking. Pelunasan dilakukan sebelum hari keberangkatan sesuai batas waktu yang berlaku.', 'pembayaran', 3, true),
  ('Apakah kendaraan pasti tersedia setelah pembayaran?', 'Pembayaran yang berhasil akan kami proses untuk konfirmasi ketersediaan kendaraan. Jika kendaraan tidak tersedia, kami akan menawarkan alternatif atau pengembalian dana sesuai kebijakan yang berlaku.', 'booking', 4, true),
  ('Bagaimana kebijakan pembatalan?', 'Kebijakan pembatalan dan pengembalian dana tertera di halaman Syarat & Ketentuan. Silakan baca sebelum melakukan pemesanan.', 'pembatalan', 5, true),
  ('Apakah bisa request penjemputan di luar area?', 'Area penjemputan standar adalah Kota Banyuwangi, Stasiun, Pelabuhan Ketapang, dan Bandara Blimbingsari. Penjemputan di luar area mungkin dikenakan biaya tambahan. Hubungi admin untuk informasi.', 'booking', 6, true),
  ('Apa bedanya sewa harian dengan paket rute?', 'Paket rute memiliki destinasi dan durasi tertentu. Sewa harian memberikan fleksibilitas untuk menentukan tujuan sendiri dalam batas area dan durasi yang disepakati.', 'layanan', 7, true),
  ('Bagaimana jika cuaca buruk?', 'Keberangkatan tetap sesuai jadwal kecuali ada kondisi darurat. Perubahan jadwal dapat diajukan melalui halaman pesanan Anda. Kebijakan reschedule sesuai ketentuan yang berlaku.', 'umum', 8, true);

-- ============================================================
-- LANDING SECTIONS
-- ============================================================

INSERT INTO landing_sections (section_type, title, subtitle, content, sort_order, is_active) VALUES
  ('hero', 'Jelajahi Banyuwangi dengan Jeep Trooper', 'Kawah Ijen, Baluran, De Djawatan, dan destinasi spektakuler lainnya.', '{"cta_text": "Lihat Semua Paket", "cta_href": "/sewa"}', 1, true),
  ('categories', 'Pilih Layanan Sesuai Kebutuhan', 'Tiga jenis layanan untuk berbagai kebutuhan wisata dan perjalanan.', '{}', 2, true),
  ('featured', 'Paket Wisata Populer', 'Destinasi favorit wisatawan dengan rute terencana dan sopir berpengalaman.', '{"limit": 4}', 3, true),
  ('howto', 'Cara Booking', 'Empat langkah mudah untuk memesan Jeep Trooper Anda.', '{}', 4, true),
  ('features', 'Mengapa Memilih Kami?', 'Komitmen kami untuk pengalaman wisata terbaik di Banyuwangi.', '{}', 5, true),
  ('faq', 'Pertanyaan Umum', 'Jawaban untuk pertanyaan yang sering diajukan.', '{"limit": 5}', 6, true),
  ('cta', 'Siap Berpetualang di Banyuwangi?', 'Booking Jeep Trooper sekarang dan nikmati destinasi wisata terbaik.', '{}', 7, true);

-- ============================================================
-- SITE SETTINGS
-- ============================================================

INSERT INTO site_settings (key, value, category, description) VALUES
  ('site_name', '"Sewa Trooper Banyuwangi"', 'general', 'Nama website'),
  ('site_tagline', '"Jelajahi Wisata Banyuwangi dengan Jeep Trooper"', 'general', 'Tagline website'),
  ('contact_whatsapp', '""', 'contact', 'Nomor WhatsApp (diisi owner)'),
  ('contact_email', '""', 'contact', 'Email kontak (diisi owner)'),
  ('contact_address', '"Banyuwangi, Jawa Timur"', 'contact', 'Alamat usaha'),
  ('service_area', '"Banyuwangi dan sekitarnya"', 'general', 'Cakupan area layanan'),
  ('primary_color', '"#15673e"', 'appearance', 'Warna utama (hijau hutan)'),
  ('accent_color', '"#e97316"', 'appearance', 'Warna aksen (oranye)'),
  ('maintenance_mode', 'false', 'system', 'Mode maintenance'),
  ('checkout_enabled', 'true', 'system', 'Checkout aktif');

-- ============================================================
-- MENUS
-- ============================================================

INSERT INTO menus (location, items) VALUES
  ('header', '[
    {"label": "Beranda", "href": "/"},
    {"label": "Sewa Trooper", "href": "/sewa"},
    {"label": "Artikel", "href": "/artikel"},
    {"label": "Tentang Kami", "href": "/tentang"},
    {"label": "Kontak", "href": "/kontak"}
  ]'),
  ('footer', '[
    {"label": "Syarat & Ketentuan", "href": "/syarat-ketentuan"},
    {"label": "Kebijakan Pembatalan", "href": "/kebijakan-pembatalan"},
    {"label": "Kebijakan Privasi", "href": "/kebijakan-privasi"},
    {"label": "FAQ", "href": "/faq"}
  ]');

-- ============================================================
-- NOTIFICATION TEMPLATES
-- ============================================================

INSERT INTO notification_templates (name, channel, subject, body_template, variables, is_active) VALUES
  ('booking_created', 'in_app', 'Pesanan Baru', 'Pesanan {{booking_code}} telah dibuat. Menunggu pembayaran.', ARRAY['booking_code', 'product_name', 'total_amount'], true),
  ('payment_received', 'in_app', 'Pembayaran Diterima', 'Pembayaran untuk pesanan {{booking_code}} telah diterima. Menunggu konfirmasi kendaraan.', ARRAY['booking_code', 'amount', 'payment_type'], true),
  ('booking_confirmed', 'in_app', 'Pesanan Dikonfirmasi', 'Kendaraan untuk pesanan {{booking_code}} telah dikonfirmasi. Selamat berpetualang!', ARRAY['booking_code', 'service_date'], true),
  ('booking_cancelled', 'in_app', 'Pesanan Dibatalkan', 'Pesanan {{booking_code}} telah dibatalkan. {{reason}}', ARRAY['booking_code', 'reason'], true),
  ('balance_reminder', 'in_app', 'Pengingat Pelunasan', 'Pesanan {{booking_code}} menunggu pelunasan sebesar {{outstanding}}. Batas pelunasan: {{deadline}}.', ARRAY['booking_code', 'outstanding', 'deadline'], true),
  ('refund_processed', 'in_app', 'Refund Diproses', 'Refund sebesar {{amount}} untuk pesanan {{booking_code}} sedang diproses.', ARRAY['booking_code', 'amount', 'refund_method'], true);
