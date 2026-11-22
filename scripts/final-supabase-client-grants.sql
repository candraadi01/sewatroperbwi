-- Run after reconcile-migrations-016-020.sql and harden-supabase-table-grants.sql.
-- Session roles share authenticated; application-role isolation still relies on RLS.
-- Backend service_role privileges are preserved for server-side operations.
BEGIN;
SET LOCAL search_path = public, pg_catalog;
SET LOCAL lock_timeout = '5s';

DO $client_writes$
DECLARE
  relation record;
BEGIN
  FOR relation IN
    SELECT c.relname, string_agg(quote_ident(a.attname), ', ' ORDER BY a.attnum) AS columns
    FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid
    WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('r','p','v','m','f')
      AND a.attnum > 0 AND NOT a.attisdropped
    GROUP BY c.relname
  LOOP
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE, REFERENCES ON public.%I FROM PUBLIC, anon, authenticated', relation.relname);
    EXECUTE format('REVOKE INSERT (%1$s), UPDATE (%1$s), REFERENCES (%1$s) ON public.%2$I FROM PUBLIC, anon, authenticated',
                   relation.columns, relation.relname);
  END LOOP;
END
$client_writes$;

-- Buyer registration, Owner profile editing, favorites, offline schedules and payouts.
GRANT UPDATE (full_name, phone, updated_at) ON profiles TO authenticated;
GRANT INSERT (user_id,product_id), DELETE ON user_favorites TO authenticated;
GRANT INSERT (owner_id,amount,bank_name,account_number,account_holder),
      UPDATE (status,admin_notes,transfer_proof_url,processed_at) ON payout_requests TO authenticated;
GRANT INSERT (owner_id,product_id,vehicle_name,renter_name,renter_phone,start_date,end_date,notes,source),
      UPDATE (owner_id,product_id,vehicle_name,renter_name,renter_phone,start_date,end_date,notes,source,updated_at),
      DELETE ON offline_schedules TO authenticated;

-- Session-backed Admin resource forms, article routes and calendar actions.
GRANT INSERT, UPDATE ON site_settings, product_categories, pricing_rules, blackout_dates,
  sales_quotas, pickup_zones, promos, pages, articles, testimonials, destinations, faqs,
  landing_sections, menus, media TO authenticated;
GRANT DELETE ON articles, blackout_dates TO authenticated;
GRANT INSERT ON article_categories TO authenticated;
GRANT UPDATE (default_start_time) ON products TO authenticated;

-- Internal trigger helpers and identifier generators are not exposed as client RPCs.
REVOKE EXECUTE ON FUNCTION audit_admin_changes(), generate_booking_code(), generate_invoice_number(),
  handle_new_user(), protect_booking_finances(), protect_profile_fields(), update_updated_at()
  FROM PUBLIC, anon, authenticated;

DO $cloud_helper$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;
END
$cloud_helper$;

REVOKE EXECUTE ON FUNCTION consume_rate_limit(text,integer,integer), reserve_booking(jsonb),
  prepare_balance_payment(uuid,uuid,uuid), prepare_initial_payment(uuid,uuid,payment_purpose),
  apply_midtrans_event(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION consume_rate_limit(text,integer,integer), reserve_booking(jsonb),
  prepare_balance_payment(uuid,uuid,uuid), prepare_initial_payment(uuid,uuid,payment_purpose),
  apply_midtrans_event(jsonb) TO service_role;

-- Keep the columns used by the public package-availability queries.
REVOKE SELECT ON blackout_dates, sales_quotas FROM PUBLIC, anon;
GRANT SELECT (id,product_id,date,reason) ON blackout_dates TO anon;
GRANT SELECT (id,product_id,date,max_units,booked_units) ON sales_quotas TO anon;

COMMIT;
