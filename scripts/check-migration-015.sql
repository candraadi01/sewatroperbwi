BEGIN TRANSACTION READ ONLY;

WITH expected(slug, route_name, short_description) AS (
  VALUES
    ('harian-sopir', 'Banyuwangi Kota & Destinasi Pilihan',
     'Keliling Kota & Destinasi Pilihan Bebas (12 Jam)'),
    ('lepas-kunci', 'Area Banyuwangi Raya (Rute Bebas)',
     'Lepas Kunci Bebas Keliling Banyuwangi Raya (24 Jam)')
)
SELECT e.slug,
       CASE
         WHEN p.id IS NULL THEN 'missing_product'
         WHEN p.route_name IS NOT DISTINCT FROM e.route_name
          AND p.short_description IS NOT DISTINCT FROM e.short_description THEN 'matches_015'
         ELSE 'differs_from_015'
       END AS status,
       p.route_name IS NOT DISTINCT FROM e.route_name AS route_matches,
       p.short_description IS NOT DISTINCT FROM e.short_description AS description_matches
FROM expected e
LEFT JOIN public.products p USING (slug)
ORDER BY e.slug;

ROLLBACK;
