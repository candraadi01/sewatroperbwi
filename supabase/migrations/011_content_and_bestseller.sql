-- ============================================================
-- 011_content_and_bestseller.sql
-- Menambahkan:
-- 1. Kolom is_best_seller pada tabel products
-- 2. Kolom cover_image_url dan category_name pada tabel articles
-- 3. Tabel testimonials (Testimoni Pelanggan)
-- 4. Tabel destinations (Destinasi Wisata Banyuwangi)
-- 5. Seed data real-time untuk Testimoni, Destinasi, dan Artikel
-- ============================================================

-- 1. Kolom Best Seller pada Produk
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;

-- Tandai paket terpopuler sebagai best seller secara default
UPDATE products SET is_best_seller = true WHERE slug IN ('offroad-sukamade', 'jeep-kawah-ijen') OR name ILIKE '%sukamade%';

-- 2. Kolom tambahan pada Artikel
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT '';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_name TEXT DEFAULT 'Destinasi Wisata Banyuwangi';

-- 3. Tabel Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT DEFAULT 'Banyuwangi',
  rating_text TEXT DEFAULT 'RATING 5/5',
  stars INTEGER NOT NULL DEFAULT 5,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "testimonials_public_read" ON testimonials;
CREATE POLICY "testimonials_public_read" ON testimonials
  FOR SELECT TO public
  USING (is_active = true OR (auth.jwt()->>'role' = 'authenticated'));

DROP POLICY IF EXISTS "testimonials_admin_write" ON testimonials;
CREATE POLICY "testimonials_admin_write" ON testimonials
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed data awal Testimonials
INSERT INTO testimonials (name, city, rating_text, stars, content, sort_order)
SELECT 'Anis Mulan', 'Yogyakarta', 'RATING 5/5', 5,
  'Pelayanan persewaan jeep di Banyuwangi sangat memuaskan. Admin ramah dan responsif saat memberikan informasi maupun membantu proses pemesanan. Driver jeep berpengalaman, tepat waktu, serta mengutamakan keselamatan dan kenyamanan selama perjalanan. Kondisi jeep bersih, terawat, dan nyaman digunakan untuk wisata.', 1
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Anis Mulan');

INSERT INTO testimonials (name, city, rating_text, stars, content, sort_order)
SELECT 'Deki Firmansyah', 'Jakarta', 'RATING 5/5', 5,
  'Pelayanan sewa jeep di Banyuwangi ini benar-benar recommended! Driver ramah, jeep bersih dan nyaman dipakai keliling wisata. Perjalanan ke Baluran dan Kawah Ijen jadi makin seru karena drivernya juga sekalian jadi guide yang informatif. Tepat waktu, harga sesuai, dan dokumentasi fotonya keren banget.', 2
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Deki Firmansyah');

INSERT INTO testimonials (name, city, rating_text, stars, content, sort_order)
SELECT 'Rina Kusuma Dewi', 'Surabaya', 'RATING 5/5', 5,
  'Pengalaman liburan keluarga yang tak terlupakan naik Jeep Trooper ke Pantai Sukamade dan Hutan De Djawatan. Driver sangat sabar dan mengutamakan keselamatan saat melintasi medan offroad sungai. Anak-anak sangat gembira, unit bersih dan terawat dengan sangat prima!', 3
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Rina Kusuma Dewi');

INSERT INTO testimonials (name, city, rating_text, stars, content, sort_order)
SELECT 'Aditya Pratama', 'Bandung', 'RATING 5/5', 5,
  'Sewa jeep untuk sunrise Kawah Wurung dan Kawah Ijen luar biasa puas! Penjemputan tepat waktu dini hari, perlengkapan senter dan masker gas bersih. Driver tahu titik spot foto terbaik yang jarang dikunjungi orang lain. Pasti akan sewa lagi di sini!', 4
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Aditya Pratama');


-- 4. Tabel Destinations
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Gunung',
  district TEXT DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  highlights TEXT[] DEFAULT '{}',
  image_url TEXT DEFAULT '',
  query_param TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "destinations_public_read" ON destinations;
CREATE POLICY "destinations_public_read" ON destinations
  FOR SELECT TO public
  USING (is_active = true OR (auth.jwt()->>'role' = 'authenticated'));

DROP POLICY IF EXISTS "destinations_admin_write" ON destinations;
CREATE POLICY "destinations_admin_write" ON destinations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed data awal Destinasi
INSERT INTO destinations (name, slug, category, district, description, highlights, image_url, query_param, sort_order)
SELECT 'Kawah Ijen', 'kawah-ijen', 'Gunung', 'Kecamatan Licin',
  'Kawah vulkanik kaldera Ijen dengan danau asam toska terbesar di dunia, fenomena langka Blue Fire (Api Biru), dan panorama sunrise spektakuler di bibir kawah.',
  ARRAY['Blue Fire Alami', 'Danau Kawah Toska', 'Sunrise Spektakuler'],
  '/images/landing/tour-kawah-ijen.jpg', 'ijen', 1
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE slug = 'kawah-ijen');

INSERT INTO destinations (name, slug, category, district, description, highlights, image_url, query_param, sort_order)
SELECT 'Taman Nasional Baluran', 'baluran', 'Taman Nasional', 'Kecamatan Wongsorejo',
  'Africa Van Java di ujung timur Jawa dengan padang Savana Bekol yang membentang luas, kawanan banteng jawa, rusa, monyet ekor panjang, dan Pantai Bama asri.',
  ARRAY['Savana Bekol Luas', 'Pantai Bama & Mangrove', 'Safari Satwa Liar'],
  '/images/landing/tour-baluran.jpg', 'baluran', 2
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE slug = 'baluran');

INSERT INTO destinations (name, slug, category, district, description, highlights, image_url, query_param, sort_order)
SELECT 'Hutan De Djawatan', 'de-djawatan', 'Hutan & Alam', 'Kecamatan Cluring',
  'Hutan trembesi purba berkanopi magis bak latar film The Lord of the Rings. Suasana teduh asri dengan sorot sinar matahari alami menembus pepohonan raksasa.',
  ARRAY['Pohon Trembesi Raksasa', 'Spot Foto Lord of the Rings', 'Wisata Keluarga Asri'],
  '/images/landing/tour-djawatan.jpg', 'djawatan', 3
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE slug = 'de-djawatan');

INSERT INTO destinations (name, slug, category, district, description, highlights, image_url, query_param, sort_order)
SELECT 'Pantai Sukamade', 'pantai-sukamade', 'Pantai & Bahari', 'Kecamatan Pesanggaran',
  'Konservasi penyu bertelur legendaris di kawasan Taman Nasional Meru Betiri. Menawarkan petualangan offroad ekstrem melintasi sungai berbatu dan rimba pesisir.',
  ARRAY['Konservasi Penyu Hijau', 'Trek Offroad Sungai', 'Pelepasan Tukik'],
  '/images/landing/tour-sukamade.jpg', 'sukamade', 4
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE slug = 'pantai-sukamade');

INSERT INTO destinations (name, slug, category, district, description, highlights, image_url, query_param, sort_order)
SELECT 'Teluk Hijau (Green Bay)', 'teluk-hijau', 'Pantai & Bahari', 'Kecamatan Pesanggaran',
  'Surga tersembunyi berpasir putih bersih dengan gradasi air laut hijau toska menakjubkan yang dikelilingi tebing hutan tropis rimbun.',
  ARRAY['Air Laut Hijau Toska', 'Air Terjun Tepi Pantai', 'Pasir Putih Bersih'],
  '/images/landing/tour-teluk-hijau.jpg', 'teluk-hijau', 5
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE slug = 'teluk-hijau');

INSERT INTO destinations (name, slug, category, district, description, highlights, image_url, query_param, sort_order)
SELECT 'Kawah Wurung', 'kawah-wurung', 'Gunung', 'Kecamatan Ijen',
  'Hamparan perbukitan hijau meliuk-liuk bagaikan Bukit Teletubbies di ketinggian pegunungan Ijen. Udara sejuk dengan pemandangan 360 derajat.',
  ARRAY['Bukit Teletubbies Hijau', 'Spot Foto 360 Derajat', 'Trek Offroad Rerumputan'],
  '/images/landing/tour-kawah-ijen.jpg', 'kawah-wurung', 6
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE slug = 'kawah-wurung');


-- 5. Seed awal data artikel jika belum ada
INSERT INTO articles (title, slug, excerpt, content, status, published_at, cover_image_url, category_name)
SELECT 
  'Menjangan hingga Baluran, Trip Banyuwangi yang Bikin Nagih',
  'menjangan-hingga-baluran-trip-banyuwangi',
  'Kalau selama ini Banyuwangi hanya dikenal sebagai pintu masuk menuju Kawah Ijen, berarti Anda belum melihat seluruh keseruannya. Banyuwangi punya kombinasi destinasi yang sulit ditolak: laut sebening kaca, pulau tropis, snorkeling, hutan hijau, savana luas, sampai satwa liar di kawasan konservasi. Salah satu cara terbaik untuk menikmati semuanya adalah dengan sewa jeep Trooper 4x4...',
  '[{"type":"paragraph","text":"Kalau selama ini Banyuwangi hanya dikenal sebagai pintu masuk menuju Kawah Ijen, berarti Anda belum melihat seluruh keseruannya. Banyuwangi punya kombinasi destinasi yang sulit ditolak: laut sebening kaca, pulau tropis, snorkeling, hutan hijau, savana luas, sampai satwa liar di kawasan konservasi. Salah satu cara terbaik untuk menikmati semuanya adalah dengan sewa jeep Trooper 4x4."}]'::jsonb,
  'published',
  now(),
  '/images/landing/article-menjangan.jpg',
  'Destinasi Wisata Banyuwangi'
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'menjangan-hingga-baluran-trip-banyuwangi');

INSERT INTO articles (title, slug, excerpt, content, status, published_at, cover_image_url, category_name)
SELECT 
  'Liburan ke Alas Purwo, Pilih Sewa Jeep Banyuwangi Tanpa Ribet',
  'liburan-ke-alas-purwo-pilih-sewa-jeep-tanpa-ribet',
  'Liburan itu harusnya bikin kepala fresh, bukan malah stres mikirin jalan, kendaraan, atau takut nyasar. Kalau destinasi impianmu adalah Taman Nasional Alas Purwo, pilihan paling praktis adalah menggunakan sewa jeep Banyuwangi. Alas Purwo dikenal sebagai salah satu kawasan alam paling ikonik di ujung timur Pulau Jawa. Hutan tropis, savana, pantai eksotis, hingga satwa liar...',
  '[{"type":"paragraph","text":"Liburan itu harusnya bikin kepala fresh, bukan malah stres mikirin jalan, kendaraan, atau takut nyasar. Kalau destinasi impianmu adalah Taman Nasional Alas Purwo, pilihan paling praktis adalah menggunakan sewa jeep Banyuwangi. Alas Purwo dikenal sebagai salah satu kawasan alam paling ikonik di ujung timur Pulau Jawa."}]'::jsonb,
  'published',
  now(),
  '/images/landing/article-alaspurwo.jpg',
  'Sewa Jeep Banyuwangi'
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'liburan-ke-alas-purwo-pilih-sewa-jeep-tanpa-ribet');

INSERT INTO articles (title, slug, excerpt, content, status, published_at, cover_image_url, category_name)
SELECT 
  'Seberapa Menantang Perjalanan Menuju Air Terjun Jagir bagi Wisatawan Pemula?',
  'seberapa-menantang-perjalanan-air-terjun-jagir',
  'Banyuwangi dikenal sebagai salah satu destinasi wisata di Jawa Timur yang memiliki beragam keindahan alam tersembunyi. Bagi Anda yang baru pertama kali berkunjung, Air Terjun Jagir sering kali menjadi tujuan favorit karena aksesnya yang relatif ramah namun tetap menyuguhkan pesona gemericik air jernih dan suasana asri pegunungan...',
  '[{"type":"paragraph","text":"Banyuwangi dikenal sebagai salah satu destinasi wisata di Jawa Timur yang memiliki beragam keindahan alam tersembunyi. Bagi Anda yang baru pertama kali berkunjung, Air Terjun Jagir sering kali menjadi tujuan favorit karena aksesnya yang relatif ramah namun tetap menyuguhkan pesona gemericik air jernih dan suasana asri pegunungan."}]'::jsonb,
  'published',
  now(),
  '/images/landing/article-jagir.jpg',
  'Destinasi Wisata Banyuwangi'
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'seberapa-menantang-perjalanan-air-terjun-jagir');
