-- Migration 015: Lengkapi Titik Lokasi Destinasi Produk
UPDATE products
SET route_name = 'Banyuwangi Kota & Destinasi Pilihan',
    short_description = 'Keliling Kota & Destinasi Pilihan Bebas (12 Jam)'
WHERE slug = 'harian-sopir';

UPDATE products
SET route_name = 'Area Banyuwangi Raya (Rute Bebas)',
    short_description = 'Lepas Kunci Bebas Keliling Banyuwangi Raya (24 Jam)'
WHERE slug = 'lepas-kunci';
