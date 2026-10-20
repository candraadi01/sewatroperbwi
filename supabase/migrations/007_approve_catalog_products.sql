-- 007_approve_catalog_products.sql
-- Aktifkan produk katalog resmi agar dapat dibooking (bukan sample data lagi)

UPDATE public.products 
SET 
  is_sample_data = false,
  is_owner_approved = true,
  status = 'active'
WHERE status = 'active';

UPDATE public.pricing_rules
SET is_sample_data = false
WHERE is_active = true;

