-- ============================================================
-- Sewa Trooper BWI — Migration 008: Sync Landing Catalog & Slugs
-- Menyelaraskan seluruh produk katalog landing page dengan database,
-- memastikan slug kawah-ijen-baluran dan lainnya aktif, disetujui owner,
-- dan memiliki pricing_rules valid sehingga bebas 404 & siap booking.
-- ============================================================

-- Pastikan kategori tersedia
INSERT INTO product_categories (id, name, slug, description, sort_order, is_active)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Paket Jeep Experience', 'jeep-experience', 'Paket tour paling hemat dan paling banyak diminati di Banyuwangi raya.', 1, true),
  ('a1000000-0000-0000-0000-000000000002', 'Jeep Wisata Banyuwangi', 'jeep-wisata', 'Berbagai paket wisata Jeep Trooper lengkap siap melayani petualangan keluarga.', 2, true),
  ('a1000000-0000-0000-0000-000000000003', 'Sewa Harian + Sopir', 'harian-sopir', 'Sewa kendaraan harian dengan sopir untuk fleksibilitas perjalanan.', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  is_active = true;

-- Upsert Produk 1 s/d 10 agar identik dengan katalog resmi landing page
INSERT INTO products (
  id, category_id, name, slug, description, short_description, service_type, status,
  passenger_capacity, driver_included, duration_minutes, route_name, start_point, end_point,
  included_facilities, excluded_facilities, terms_version, terms_content,
  min_booking_hours, overtime_rate_per_hour, is_sample_data, is_owner_approved, sort_order, cover_image_url
) VALUES
-- 1. Sukamade
(
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'SEWA JEEP PANTAI SUKAMADE',
  'jeep-sukamade',
  'Petualangan offroad legendaris menuju Pantai Sukamade di Taman Nasional Meru Betiri. Melintasi sungai berbatu, perkebunan kakao, dan menyaksikan penyu bertelur di malam hari.',
  'Konservasi Penyu & Safari Malam Meru Betiri',
  'paket_rute',
  'active',
  6, true, 1440, 'Pantai Sukamade', 'Area Banyuwangi Kota (Hotel / Stasiun)', 'Kembali ke titik penjemputan semula',
  ARRAY['Kendaraan Jeep Trooper 4x4 offroad terawat', 'Driver berpengalaman rute sungai & hutan', 'Bahan Bakar Minyak (BBM) selama trip', 'Air mineral botol untuk seluruh peserta'],
  ARRAY['Tiket masuk gerbang TN Meru Betiri & donasi penyu', 'Penginapan wisma Sukamade', 'Makan dan pengeluaran pribadi'],
  'v1', 'Wajib mengikuti arahan ranger konservasi saat mengamati penyu bertelur di pantai malam hari.',
  24, 75000, false, true, 1, '/images/landing/tour-sukamade.jpg'
),
-- 2. Baluran + Fotografer
(
  'b1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'SEWA JEEP BALURAN + FOTOGRAFER',
  'jeep-baluran',
  'Eksplorasi Africa Van Java di Savana Bekol dan Pantai Bama dengan Jeep Trooper gagah, lengkap dengan fotografer untuk dokumentasi estetik perjalanan Anda.',
  'Savana Bekol (Africa Van Java) & Spot Banteng',
  'paket_rute',
  'active',
  6, true, 540, 'Baluran', 'Area Banyuwangi Kota / Pintu Masuk Baluran', 'Kembali ke titik penjemputan semula',
  ARRAY['Jeep Trooper 4x4 nyaman & siap medan', 'Driver ramah & menguasai spot foto terbaik', 'Dokumentasi foto pro sepanjang trip', 'BBM pulang-pergi'],
  ARRAY['Tiket masuk TN Baluran', 'Makan siang pribadi'],
  'v1', 'Dilarang memberi makan satwa liar dan merusak vegetasi savana.',
  24, 75000, false, true, 2, '/images/landing/tour-baluran.jpg'
),
-- 3. De Djawatan
(
  'b1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'SEWA JEEP HUTAN DE DJAWATAN',
  'jeep-djawatan',
  'Masuki hutan magis berlumut De Djawatan bak negeri dongeng Lord of the Rings. Destinasi favorit untuk santai keluarga dan spot foto ikonik bersama armada 4x4.',
  'Hutan Lord of the Rings Pohon Trembesi Purba',
  'paket_rute',
  'active',
  6, true, 300, 'De Djawatan', 'Area Banyuwangi Kota', 'Kembali ke titik penjemputan semula',
  ARRAY['Jeep Trooper 4x4 bersih & ber-AC', 'Driver ramah & mengarahkan pose foto terbaik', 'BBM perjalanan', 'Air mineral'],
  ARRAY['Tiket masuk De Djawatan', 'Wahana dokar / kuda'],
  'v1', 'Waktu terbaik adalah pagi hari saat sorot cahaya matahari menembus kanopi trembesi.',
  24, 75000, false, true, 3, '/images/landing/tour-djawatan.jpg'
),
-- 4. Ijen + Wurung
(
  'b1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000002',
  'KAWAH IJEN + KAWAH WURUNG',
  'kawah-ijen-kawah-wurung',
  'Dua lanskap pegunungan spektakuler: Api biru (Blue Fire) dini hari di Kawah Ijen dilanjutkan pagi harinya ke savana perbukitan hijau Kawah Wurung.',
  'Kawah Ijen (Blue Fire) & Savana Bukit Teletubbies',
  'paket_rute',
  'active',
  6, true, 600, 'Ijen & Wurung', 'Area Banyuwangi Kota (Jemput jam 00.00)', 'Kembali ke hotel / stasiun',
  ARRAY['Jeep Trooper 4x4 tangguh tanjakan Ijen', 'Driver ramah & berpengalaman rute malam', 'BBM penuh selama perjalanan', 'Masker gas & senter standar'],
  ARRAY['Tiket masuk TWA Ijen & Kawah Wurung', 'Makan'],
  'v1', 'Siapkan jaket tebal dan pakaian hangat.',
  24, 75000, false, true, 4, '/images/landing/tour-kawah-ijen.jpg'
),
-- 5. Kawah Ijen + Baluran (URL: /sewa/kawah-ijen-baluran)
(
  'b1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000002',
  'KAWAH IJEN + BALURAN',
  'kawah-ijen-baluran',
  'Kombinasi sempurna gunung berapi dan savana liar. Saksikan sunrise Ijen lalu bersafari ke Savana Bekol dan Pantai Bama di Taman Nasional Baluran.',
  'Kawah Ijen (Sunrise & Blue Fire) & TN Baluran',
  'paket_rute',
  'active',
  6, true, 840, 'Ijen & Baluran', 'Area Banyuwangi Kota', 'Kembali ke titik jemput',
  ARRAY['Jeep Trooper 4x4 full day service', 'Driver guide berpengalaman', 'BBM rute kombinasi Ijen - Baluran', 'Air mineral'],
  ARRAY['Tiket masuk Ijen & Baluran', 'Makan'],
  'v1', 'Rute full day, istirahat cukup sebelum keberangkatan.',
  24, 75000, false, true, 5, '/images/landing/tour-baluran.jpg'
),
-- 6. De Djawatan + Sukamade
(
  'b1000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000002',
  'DE DJAWATAN + SUKAMADE',
  'de-djawatan-sukamade',
  'Petualangan menyusuri hutan trembesi purba De Djawatan lalu diteruskan ekspedisi offroad menyusuri sungai dan rimba Meru Betiri menuju Pantai Sukamade.',
  'Hutan Trembesi Purba & Pantai Penyu Sukamade',
  'paket_rute',
  'active',
  6, true, 1440, 'Djawatan & Sukamade', 'Area Banyuwangi Kota', 'Kembali ke titik semula',
  ARRAY['Jeep Trooper 4x4 tangguh & terawat', 'Driver offroad terpercaya', 'BBM penuh rute 2D1N', 'Air mineral'],
  ARRAY['Tiket masuk lokasi & donasi konservasi', 'Makan'],
  'v1', 'Membawa perlengkapan pribadi untuk menginap di kawasan Sukamade.',
  24, 75000, false, true, 6, '/images/landing/tour-sukamade.jpg'
),
-- 7. Safari Baluran & Fotografer
(
  'b1000000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000002',
  'SAFARI BALURAN & FOTOGRAFER',
  'safari-baluran-fotografer',
  'Jelajahi Savana Bekol, Pantai Bama, dan spot satwa liar di Taman Nasional Baluran dengan Jeep Trooper disertai layanan foto dokumentasi profesional.',
  'Savana Bekol & Dokumentasi Foto Pro',
  'paket_rute',
  'active',
  6, true, 540, 'Baluran Safari', 'Area Banyuwangi Kota', 'Kembali ke titik semula',
  ARRAY['Jeep Trooper 4x4 offroad safari', 'Driver pemandu rute', 'Dokumentasi foto perjalanan', 'BBM pulang-pergi'],
  ARRAY['Tiket masuk kawasan Baluran', 'Makan'],
  'v1', 'File foto diserahkan via cloud link setelah perjalanan.',
  24, 75000, false, true, 7, '/images/landing/tour-baluran.jpg'
),
-- 8. Kawah Wurung + Djawatan
(
  'b1000000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000002',
  'KAWAH WURUNG + DJAWATAN',
  'kawah-wurung-djawatan',
  'Paduan keindahan perbukitan hijau Kawah Wurung di lereng Ijen dan kanopi raksasa magis De Djawatan dalam rute satu hari yang efisien.',
  'Kawah Wurung Highland & De Djawatan',
  'paket_rute',
  'active',
  6, true, 540, 'Wurung & Djawatan', 'Area Banyuwangi Kota', 'Kembali ke titik jemput',
  ARRAY['Jeep Trooper 4x4 terawat', 'Driver ramah & pemandu rute', 'BBM pulang-pergi', 'Air mineral'],
  ARRAY['Tiket masuk lokasi', 'Makan'],
  'v1', 'Membawa jaket dan kacamata hitam untuk kenyamanan.',
  24, 75000, false, true, 8, '/images/landing/tour-djawatan.jpg'
),
-- 9. Offroad Sukamade
(
  'b1000000-0000-0000-0000-000000000009',
  'a1000000-0000-0000-0000-000000000002',
  'OFFROAD SUKAMADE ADVENTURE',
  'offroad-sukamade',
  'Ekspedisi offroad sejati menerobos jalur sungai dan rimba basah Meru Betiri, menyapa penyu raksasa bertelur di Sukamade, dan melihat panorama Teluk Hijau.',
  'Trek Offroad Rimba Meru Betiri & Penyu',
  'paket_rute',
  'active',
  6, true, 1440, 'Meru Betiri & Sukamade', 'Area Banyuwangi Kota', 'Kembali ke titik jemput',
  ARRAY['Jeep Trooper 4x4 spesifikasi offroad berat', 'Driver offroad bersertifikasi', 'BBM penuh ekspedisi 2D1N', 'Air mineral'],
  ARRAY['Tiket masuk & donasi penyu', 'Makan'],
  'v1', 'Siapkan fisik yang prima dan pakaian ganti cadangan.',
  24, 75000, false, true, 9, '/images/landing/tour-sukamade.jpg'
),
-- 10. Sewa Harian Trooper Kota
(
  'b1000000-0000-0000-0000-000000000010',
  'a1000000-0000-0000-0000-000000000003',
  'SEWA JEEP TROOPER HARIAN + DRIVER KOTA',
  'sewa-trooper-harian-kota',
  'Sewa Jeep Trooper 4x4 seharian penuh (12 Jam) lengkap dengan driver berpengalaman. Rute bebas keliling Banyuwangi kota, kuliner khas Osing, dan spot wisata sekitar.',
  'Sewa Trooper City Tour & Kuliner Banyuwangi (12 Jam)',
  'harian_sopir',
  'active',
  6, true, 720, 'Banyuwangi Kota & Sekitarnya', 'Area Banyuwangi Kota (Hotel / Stasiun / Bandara)', 'Kembali ke titik penjemputan',
  ARRAY['Unit Jeep Trooper 4x4 full AC & bersih', 'Driver ramah & memahami rute kota', 'BBM area Banyuwangi Kota'],
  ARRAY['Tiket masuk destinasi wisata', 'Makan driver & peserta'],
  'v1', 'Overtime berlaku Rp 75.000 per jam jika melebihi durasi sewa 12 jam.',
  24, 75000, false, true, 10, '/images/landing/hero-bg.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  service_type = EXCLUDED.service_type,
  status = 'active',
  passenger_capacity = EXCLUDED.passenger_capacity,
  driver_included = EXCLUDED.driver_included,
  duration_minutes = EXCLUDED.duration_minutes,
  route_name = EXCLUDED.route_name,
  start_point = EXCLUDED.start_point,
  end_point = EXCLUDED.end_point,
  included_facilities = EXCLUDED.included_facilities,
  excluded_facilities = EXCLUDED.excluded_facilities,
  terms_version = EXCLUDED.terms_version,
  terms_content = EXCLUDED.terms_content,
  min_booking_hours = EXCLUDED.min_booking_hours,
  overtime_rate_per_hour = EXCLUDED.overtime_rate_per_hour,
  is_sample_data = false,
  is_owner_approved = true,
  sort_order = EXCLUDED.sort_order,
  cover_image_url = EXCLUDED.cover_image_url,
  updated_at = NOW();

-- Sinkronisasi pricing_rules untuk 10 produk tersebut
-- Hapus pricing rules lama yang tidak sesuai prioritas agar bersih
DELETE FROM pricing_rules WHERE product_id IN (
  'b1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000003',
  'b1000000-0000-0000-0000-000000000004',
  'b1000000-0000-0000-0000-000000000005',
  'b1000000-0000-0000-0000-000000000006',
  'b1000000-0000-0000-0000-000000000007',
  'b1000000-0000-0000-0000-000000000008',
  'b1000000-0000-0000-0000-000000000009',
  'b1000000-0000-0000-0000-000000000010'
);

INSERT INTO pricing_rules (
  id, product_id, name, base_price, price_unit, priority, is_active, is_sample_data
) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Tarif Sewa Jeep Sukamade', 1800000, 'per_vehicle', 1, true, false),
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Tarif Baluran + Dokumentasi', 1350000, 'per_vehicle', 1, true, false),
  ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'Tarif De Djawatan', 600000, 'per_vehicle', 1, true, false),
  ('d1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Tarif Kawah Ijen + Wurung', 1000000, 'per_vehicle', 1, true, false),
  ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 'Tarif Kawah Ijen + Baluran', 1250000, 'per_vehicle', 1, true, false),
  ('d1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006', 'Tarif Djawatan + Sukamade', 1800000, 'per_vehicle', 1, true, false),
  ('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000007', 'Tarif Safari Baluran & Fotografer', 1350000, 'per_vehicle', 1, true, false),
  ('d1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000008', 'Tarif Kawah Wurung + Djawatan', 1450000, 'per_vehicle', 1, true, false),
  ('d1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 'Tarif Offroad Sukamade Adventure', 2100000, 'per_vehicle', 1, true, false),
  ('d1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010', 'Tarif Sewa Trooper Harian Kota', 850000, 'per_vehicle', 1, true, false)
ON CONFLICT (id) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  is_active = true,
  is_sample_data = false;
