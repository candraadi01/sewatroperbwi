-- Apply as one batch. Any uncaught error aborts the entire transaction.
-- Locks acquired during reconciliation can be held until COMMIT.
BEGIN;

-- Rekonsiliasi skema ke hasil akhir 020. Tinjau sebelum pemakaian Cloud.
SET LOCAL search_path = public, pg_catalog;
SET LOCAL lock_timeout = '5s';

DO $reconcile$
DECLARE
  departure_type regtype;
  lock_type regtype;
BEGIN
  SELECT atttypid INTO departure_type FROM pg_attribute
    WHERE attrelid='public.products'::regclass AND attname='default_start_time' AND NOT attisdropped;
  IF departure_type = 'time without time zone'::regtype THEN
    ALTER TABLE products ALTER COLUMN default_start_time DROP DEFAULT;
    ALTER TABLE products ALTER COLUMN default_start_time TYPE text USING default_start_time::text;
    ALTER TABLE products ALTER COLUMN default_start_time SET DEFAULT '08:00:00'::text;
  ELSIF departure_type IS DISTINCT FROM 'text'::regtype THEN
    RAISE EXCEPTION 'Unexpected products.default_start_time type: %', departure_type;
  END IF;
  SELECT atttypid INTO lock_type FROM pg_attribute
    WHERE attrelid='public.payment_attempts'::regclass AND attname='choice_locked_at' AND NOT attisdropped;
  IF lock_type IS NOT NULL AND lock_type <> 'timestamptz'::regtype THEN
    RAISE EXCEPTION 'Unexpected payment_attempts.choice_locked_at type: %', lock_type;
  END IF;
END
$reconcile$;

-- Update save_admin_product function to support text default_start_time
CREATE OR REPLACE FUNCTION save_admin_product(p jsonb,p_id uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_product_id uuid;price_id uuid;
BEGIN
 IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN RAISE EXCEPTION 'Admin required';END IF;
 v_product_id=coalesce(p_id,gen_random_uuid());
 INSERT INTO products(id,name,slug,category_id,service_type,status,passenger_capacity,driver_included,duration_minutes,route_name,start_point,end_point,short_description,description,cover_image_url,included_facilities,excluded_facilities,terms_version,terms_content,min_booking_hours,overtime_rate_per_hour,is_owner_approved,is_sample_data,sort_order,dp_override_percentage,default_start_time)
 VALUES(v_product_id,p->>'name',p->>'slug',nullif(p->>'category_id','')::uuid,(p->>'service_type')::service_type,(p->>'status')::product_status,(p->>'passenger_capacity')::integer,(p->>'driver_included')::boolean,(p->>'duration_minutes')::integer,p->>'route_name',p->>'start_point',p->>'end_point',p->>'short_description',p->>'description',p->>'cover_image_url',ARRAY(SELECT jsonb_array_elements_text(p->'included_facilities')),ARRAY(SELECT jsonb_array_elements_text(p->'excluded_facilities')),p->>'terms_version',p->>'terms_content',(p->>'min_booking_hours')::integer,(p->>'overtime_rate_per_hour')::integer,(p->>'is_owner_approved')::boolean,NOT (p->>'is_owner_approved')::boolean,(p->>'sort_order')::integer,nullif(p->>'dp_override_percentage','')::integer,coalesce(nullif(p->>'default_start_time',''),'08:00')::text)
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,slug=excluded.slug,category_id=excluded.category_id,service_type=excluded.service_type,status=excluded.status,passenger_capacity=excluded.passenger_capacity,driver_included=excluded.driver_included,duration_minutes=excluded.duration_minutes,route_name=excluded.route_name,start_point=excluded.start_point,end_point=excluded.end_point,short_description=excluded.short_description,description=excluded.description,cover_image_url=excluded.cover_image_url,included_facilities=excluded.included_facilities,excluded_facilities=excluded.excluded_facilities,terms_version=excluded.terms_version,terms_content=excluded.terms_content,min_booking_hours=excluded.min_booking_hours,overtime_rate_per_hour=excluded.overtime_rate_per_hour,is_owner_approved=excluded.is_owner_approved,is_sample_data=excluded.is_sample_data,sort_order=excluded.sort_order,dp_override_percentage=excluded.dp_override_percentage,default_start_time=excluded.default_start_time;
 SELECT id INTO price_id FROM pricing_rules WHERE pricing_rules.product_id=v_product_id AND name='Tarif utama' AND date_start IS NULL AND date_end IS NULL LIMIT 1 FOR UPDATE;
 IF price_id IS NULL THEN INSERT INTO pricing_rules(product_id,name,base_price,price_unit,is_active,is_sample_data,priority) VALUES(v_product_id,'Tarif utama',(p->>'base_price')::integer,'per_vehicle',true,NOT (p->>'is_owner_approved')::boolean,10);
 ELSE UPDATE pricing_rules SET base_price=(p->>'base_price')::integer,is_sample_data=NOT (p->>'is_owner_approved')::boolean,is_active=true WHERE id=price_id;END IF;
 RETURN v_product_id;
END $$;
REVOKE ALL ON FUNCTION save_admin_product(jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION save_admin_product(jsonb,uuid) TO authenticated;

-- Apply after 018. Existing bookings and function permissions are preserved.
CREATE OR REPLACE FUNCTION approve_booking(p_id uuid, p_note text DEFAULT '', p_expires_hours integer DEFAULT 48)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $func$
DECLARE
  b bookings;
  amount integer;
  payment_deadline timestamptz;
BEGIN
  IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN
    RAISE EXCEPTION 'Active admin required';
  END IF;
  SELECT * INTO b FROM bookings WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF p_expires_hours IS NULL OR p_expires_hours NOT BETWEEN 1 AND 720 THEN
    RAISE EXCEPTION 'Invalid approval expiry';
  END IF;
  IF b.status <> 'pending_review' THEN RAISE EXCEPTION 'Booking is not awaiting review'; END IF;

  amount := CASE WHEN b.payment_choice='dp' THEN b.dp_amount ELSE b.total_amount END;
  payment_deadline := now() + make_interval(hours => p_expires_hours);

  INSERT INTO payment_attempts(booking_id,midtrans_order_id,purpose,expected_amount,idempotency_key,expires_at)
  VALUES(b.id,b.booking_code||'-1',b.payment_choice,amount,b.idempotency_key::text,payment_deadline);
  UPDATE bookings SET status='approved', approved_at=now(), approved_by=auth.uid(),
    approval_expires_at=payment_deadline WHERE id=p_id;
  INSERT INTO booking_status_history(booking_id,old_status,new_status,changed_by,reason)
  VALUES(p_id,'pending_review','approved',auth.uid(),
         coalesce(nullif(p_note,''),'Kendaraan tersedia. Disetujui oleh admin. Silakan lanjutkan pembayaran.'));
  INSERT INTO notification_outbox(recipient_id,channel,subject,body)
  VALUES(b.user_id,'in_app','Booking disetujui',
    'Booking '||b.booking_code||' disetujui. Silakan bayar sebelum '||
    to_char(payment_deadline AT TIME ZONE 'Asia/Jakarta','DD/MM/YYYY HH24:MI')||' WIB.');
  RETURN jsonb_build_object('booking_code',b.booking_code,'amount',amount,'expires_hours',p_expires_hours);
END $func$;

CREATE OR REPLACE FUNCTION reject_booking(p_id uuid, p_reason text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $func$
DECLARE b bookings;
BEGIN
  IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN
    RAISE EXCEPTION 'Active admin required';
  END IF;
  SELECT * INTO b FROM bookings WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF nullif(trim(p_reason),'') IS NULL THEN RAISE EXCEPTION 'Rejection reason required'; END IF;
  IF b.amount_paid > 0 OR b.status NOT IN ('pending_review','approved') THEN
    RAISE EXCEPTION 'Cannot reject booking with current status';
  END IF;
  UPDATE sales_quotas SET booked_units=greatest(0,booked_units-b.num_units)
    WHERE product_id=b.product_id AND date=b.service_date;
  UPDATE bookings SET status='cancelled_by_admin', rejected_at=now(), rejection_reason=p_reason WHERE id=p_id;
  INSERT INTO booking_status_history(booking_id,old_status,new_status,changed_by,reason)
  VALUES(p_id,b.status,'cancelled_by_admin',auth.uid(),p_reason);
END $func$;

GRANT EXECUTE ON FUNCTION approve_booking(uuid,text,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_booking(uuid,text) TO authenticated;

REVOKE ALL ON FUNCTION approve_booking(uuid,text,integer), reject_booking(uuid,text) FROM PUBLIC, anon;

-- Optional departure time and the booking action commit together.
CREATE OR REPLACE FUNCTION admin_approve_with_time(p_id uuid,p_note text,p_expires_hours integer,p_time time)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  PERFORM approve_booking(p_id,p_note,p_expires_hours);
  IF p_time IS NOT NULL THEN UPDATE bookings SET start_time=p_time WHERE id=p_id; END IF;
END $$;

CREATE OR REPLACE FUNCTION admin_update_trip(p_id uuid,p_status booking_status,p_note text,p_time time)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b bookings;
BEGIN
  IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Active admin required'; END IF;
  SELECT * INTO STRICT b FROM bookings WHERE id=p_id FOR UPDATE;
  IF p_status IS NOT NULL THEN
    PERFORM set_booking_status(p_id,p_status,p_note);
  ELSIF p_time IS NULL THEN
    RAISE EXCEPTION 'No change requested';
  END IF;
  IF p_time IS NOT NULL AND p_time IS DISTINCT FROM b.start_time THEN
    UPDATE bookings SET start_time=p_time WHERE id=p_id;
    INSERT INTO booking_status_history(booking_id,old_status,new_status,changed_by,reason)
    VALUES(p_id,coalesce(p_status,b.status),coalesce(p_status,b.status),auth.uid(),'Jam keberangkatan: '||p_time::text);
  END IF;
END $$;
REVOKE ALL ON FUNCTION admin_approve_with_time(uuid,text,integer,time),admin_update_trip(uuid,booking_status,text,time) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION admin_approve_with_time(uuid,text,integer,time),admin_update_trip(uuid,booking_status,text,time) TO authenticated;

-- Once a Snap request can have left the server, retries must use the same amount.
ALTER TABLE payment_attempts ADD COLUMN IF NOT EXISTS choice_locked_at timestamptz;
CREATE OR REPLACE FUNCTION prepare_initial_payment(p_booking_id uuid,p_user_id uuid,p_choice payment_purpose)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b bookings; a payment_attempts; amount integer;
BEGIN
  SELECT * INTO STRICT b FROM bookings WHERE id=p_booking_id AND user_id=p_user_id FOR UPDATE;
  IF b.status NOT IN ('approved','pending_payment') OR b.amount_paid<>0 OR b.outstanding<1 OR
     b.approval_expires_at<=now() OR p_choice IS NULL OR p_choice NOT IN ('dp','full') THEN
    RAISE EXCEPTION 'Booking not payable';
  END IF;
  SELECT * INTO STRICT a FROM payment_attempts WHERE booking_id=b.id AND purpose IN ('dp','full') AND status='pending' FOR UPDATE;
  IF a.expires_at<=now() THEN RAISE EXCEPTION 'Expired invoice'; END IF;
  amount := CASE WHEN p_choice='dp' THEN b.dp_amount ELSE b.total_amount END;
  IF (a.choice_locked_at IS NOT NULL OR a.snap_token IS NOT NULL AND a.snap_token<>'' OR
      a.snap_redirect_url IS NOT NULL AND a.snap_redirect_url<>'') AND
      (p_choice<>a.purpose OR amount<>a.expected_amount) THEN RAISE EXCEPTION 'Invoice already locked'; END IF;
  UPDATE payment_attempts SET purpose=p_choice,expected_amount=amount,choice_locked_at=coalesce(choice_locked_at,now())
    WHERE id=a.id RETURNING * INTO a;
  UPDATE bookings SET payment_choice=p_choice WHERE id=b.id RETURNING * INTO b;
  RETURN jsonb_build_object('booking',to_jsonb(b),'attempt',to_jsonb(a));
END $$;
REVOKE ALL ON FUNCTION prepare_initial_payment(uuid,uuid,payment_purpose) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION prepare_initial_payment(uuid,uuid,payment_purpose) TO service_role;

-- These tables predate the hardening migration. Existing rows stay in place.
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON payout_requests,offline_schedules,user_favorites FROM PUBLIC,anon,authenticated;
GRANT SELECT ON payout_requests TO authenticated;
GRANT INSERT(owner_id,amount,bank_name,account_number,account_holder),
      UPDATE(status,admin_notes,transfer_proof_url,processed_at) ON payout_requests TO authenticated;
DROP POLICY IF EXISTS payout_read ON payout_requests;
CREATE POLICY payout_read ON payout_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR (owner_id=auth.uid() AND has_role(auth.uid(),'owner')));
DROP POLICY IF EXISTS payout_request ON payout_requests;
CREATE POLICY payout_request ON payout_requests FOR INSERT TO authenticated
  WITH CHECK (owner_id=auth.uid() AND (has_role(auth.uid(),'owner') OR has_role(auth.uid(),'admin'))
    AND status='pending' AND processed_at IS NULL AND amount>=100000);

GRANT SELECT,DELETE ON offline_schedules TO authenticated;
DROP POLICY IF EXISTS offline_scope ON offline_schedules;
CREATE POLICY offline_scope ON offline_schedules FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR (owner_id=auth.uid() AND has_role(auth.uid(),'owner')))
  WITH CHECK (has_role(auth.uid(),'admin') OR (owner_id=auth.uid() AND has_role(auth.uid(),'owner')));

GRANT SELECT,DELETE ON user_favorites TO authenticated;
DROP POLICY IF EXISTS personal_favorites ON user_favorites;
CREATE POLICY personal_favorites ON user_favorites FOR ALL TO authenticated
  USING (user_id=auth.uid() AND has_role(auth.uid(),'buyer'))
  WITH CHECK (user_id=auth.uid() AND has_role(auth.uid(),'buyer'));

DROP POLICY IF EXISTS blackout_admin_and_owner_all ON blackout_dates;
DROP POLICY IF EXISTS quotas_admin_and_owner_all ON sales_quotas;
DROP POLICY IF EXISTS blackout_admin_write ON blackout_dates;
CREATE POLICY blackout_admin_write ON blackout_dates FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS quotas_admin_write ON sales_quotas;
CREATE POLICY quotas_admin_write ON sales_quotas FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS testimonials_public_read ON testimonials;
DROP POLICY IF EXISTS testimonials_admin_write ON testimonials;
DROP POLICY IF EXISTS testimonials_public_read ON testimonials;
CREATE POLICY testimonials_public_read ON testimonials FOR SELECT TO anon,authenticated USING (is_active);
DROP POLICY IF EXISTS testimonials_admin_write ON testimonials;
CREATE POLICY testimonials_admin_write ON testimonials FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS destinations_public_read ON destinations;
DROP POLICY IF EXISTS destinations_admin_write ON destinations;
DROP POLICY IF EXISTS destinations_public_read ON destinations;
CREATE POLICY destinations_public_read ON destinations FOR SELECT TO anon,authenticated USING (is_active);
DROP POLICY IF EXISTS destinations_admin_write ON destinations;
CREATE POLICY destinations_admin_write ON destinations FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- A permissive policy outside the known migration history could bypass these scopes.
DO $policy_check$
DECLARE unexpected text;
BEGIN
  SELECT string_agg(tablename || '.' || policyname, ', ' ORDER BY tablename, policyname)
  INTO unexpected FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('payout_requests','offline_schedules','user_favorites','testimonials',
                      'destinations','blackout_dates','sales_quotas')
    AND (tablename, policyname) NOT IN (
      ('payout_requests','payout_read'), ('payout_requests','payout_request'),
      ('payout_requests','payout_process'), ('offline_schedules','offline_scope'),
      ('user_favorites','personal_favorites'), ('testimonials','testimonials_public_read'),
      ('testimonials','testimonials_admin_write'), ('destinations','destinations_public_read'),
      ('destinations','destinations_admin_write'), ('blackout_dates','blackout_admin_write'),
      ('blackout_dates','blackout_public_read'), ('sales_quotas','quotas_admin_write'),
      ('sales_quotas','quotas_public_read'));
  IF unexpected IS NOT NULL THEN
    RAISE EXCEPTION 'Review unexpected RLS policies before reconciliation: %', unexpected;
  END IF;
END
$policy_check$;

-- Apply after 017. This changes future processing and does not rewrite existing payments.
CREATE OR REPLACE FUNCTION apply_midtrans_event(p jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  a payment_attempts;
  b bookings;
  booking_id_for_order uuid;
  stored_event_id uuid;
  paid_total integer;
  provider_status text := p->>'transaction_status';
  provider_transaction_id text := nullif(p->>'transaction_id','');
  outcome text := provider_status;
  successful boolean;
  credited boolean;
BEGIN
  SELECT booking_id INTO STRICT booking_id_for_order
    FROM payment_attempts WHERE midtrans_order_id=p->>'order_id';
  -- Invoice preparation also locks the booking before its attempts.
  SELECT * INTO STRICT b FROM bookings WHERE id=booking_id_for_order FOR UPDATE;
  SELECT * INTO STRICT a FROM payment_attempts
    WHERE booking_id=b.id AND midtrans_order_id=p->>'order_id' FOR UPDATE;

  IF (p->>'gross_amount')::numeric IS DISTINCT FROM a.expected_amount::numeric THEN
    RAISE EXCEPTION 'Amount mismatch';
  END IF;
  IF a.midtrans_transaction_id IS NOT NULL AND
     a.midtrans_transaction_id IS DISTINCT FROM provider_transaction_id THEN
    RAISE EXCEPTION 'Transaction mismatch';
  END IF;

  successful := p->>'status_code' = '200' AND (
    (provider_status='settlement' AND coalesce(p->>'fraud_status','accept')='accept') OR
    (provider_status='capture' AND p->>'fraud_status'='accept')
  );
  INSERT INTO webhook_events(provider,event_id,order_id,raw_payload,signature_valid,processed)
    VALUES('midtrans',p->>'event_id',a.midtrans_order_id,p,true,false)
    ON CONFLICT(provider,event_id) DO NOTHING RETURNING id INTO stored_event_id;
  IF stored_event_id IS NULL THEN RETURN jsonb_build_object('duplicate',true); END IF;

  SELECT EXISTS(SELECT 1 FROM payment_ledger
    WHERE payment_attempt_id=a.id AND entry_type='payment') INTO credited;
  IF successful THEN
    IF provider_transaction_id IS NULL OR
       (a.purpose='dp' AND a.expected_amount IS DISTINCT FROM b.dp_amount) OR
       (a.purpose='full' AND a.expected_amount IS DISTINCT FROM b.total_amount) OR
       (a.purpose='balance' AND NOT credited AND NOT EXISTS (
         SELECT 1 FROM payment_ledger WHERE booking_id=b.id AND entry_type='payment'
       )) OR a.purpose NOT IN ('dp','full','balance') THEN
      RAISE EXCEPTION 'Invalid payment purpose or transaction';
    END IF;
    IF NOT credited THEN
      SELECT coalesce(sum(amount),0)::integer+a.expected_amount INTO paid_total
        FROM payment_ledger WHERE booking_id=b.id AND entry_type='payment';
      INSERT INTO payment_ledger(booking_id,payment_attempt_id,entry_type,amount,balance_after,description)
        VALUES(b.id,a.id,'payment',a.expected_amount,paid_total,'Midtrans verified');
      UPDATE bookings SET amount_paid=paid_total,outstanding=greatest(0,total_amount-paid_total),
        status=CASE
          WHEN status IN ('approved','pending_payment') THEN 'payment_received'::booking_status
          WHEN status IN ('cancelled_by_admin','cancelled_by_buyer') THEN 'refund_pending'::booking_status
          ELSE status END
        WHERE id=b.id;
      outcome := 'credited';
    ELSE
      outcome := 'already_credited';
    END IF;
    UPDATE payment_attempts SET
      status=CASE WHEN provider_status='settlement' THEN 'settlement'::payment_attempt_status
                  ELSE 'captured'::payment_attempt_status END,
      paid_amount=expected_amount,midtrans_transaction_id=provider_transaction_id,
      fraud_status=coalesce(p->>'fraud_status',''),updated_at=now()
      WHERE id=a.id AND (NOT credited OR (a.status='captured' AND provider_status='settlement'));
  ELSIF provider_status IN ('refund','partial_refund') THEN
    -- Refund accounting requires a separate reconciliation of actual refund amounts.
    UPDATE bookings SET status='refund_pending' WHERE id=b.id AND status<>'refunded';
  ELSIF provider_status IN ('deny','cancel','expire','failure') THEN
    IF credited OR coalesce(a.paid_amount,0)>0 OR a.status IN ('captured','settlement') THEN
      outcome := 'requires_reconciliation_'||provider_status;
    ELSE
      UPDATE payment_attempts SET status=provider_status::payment_attempt_status,updated_at=now()
        WHERE id=a.id AND status IN ('pending','authorized');
    END IF;
  ELSIF provider_status='authorize' AND a.status='pending' AND NOT credited AND coalesce(a.paid_amount,0)=0 THEN
    UPDATE payment_attempts SET status='authorized',updated_at=now() WHERE id=a.id;
  ELSIF provider_status IN ('capture','settlement') THEN
    outcome := 'not_verified_as_success';
  END IF;

  UPDATE webhook_events SET processed=true,processed_at=now(),process_result=outcome WHERE id=stored_event_id;
  RETURN jsonb_build_object('processed',true,'booking_code',b.booking_code);
END $$;

REVOKE ALL ON FUNCTION apply_midtrans_event(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION apply_midtrans_event(jsonb) TO service_role;

-- Apply after 019. Existing rows are preserved.
DROP POLICY IF EXISTS payout_process ON payout_requests;
CREATE POLICY payout_process ON payout_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') AND owner_id <> auth.uid())
  WITH CHECK (has_role(auth.uid(),'admin') AND owner_id <> auth.uid()
    AND status IN ('approved','rejected','transferred'));

-- Ownership policies from 017 continue to apply. Keep generated IDs and
-- creation timestamps under database control.
GRANT INSERT (owner_id,product_id,vehicle_name,renter_name,renter_phone,start_date,end_date,notes,source),
      UPDATE (owner_id,product_id,vehicle_name,renter_name,renter_phone,start_date,end_date,notes,source,updated_at)
  ON offline_schedules TO authenticated;

GRANT INSERT (user_id,product_id) ON user_favorites TO authenticated;

-- Public reads and Admin writes still pass through the row policies in 017.
-- TRUNCATE and other table-level privileges do not pass through RLS.
REVOKE ALL ON testimonials,destinations FROM PUBLIC,anon,authenticated;
GRANT SELECT ON testimonials,destinations TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON testimonials,destinations TO authenticated;


-- Review and test after schema reconciliation. This script changes ACLs only.
SET LOCAL search_path = pg_catalog;
SET LOCAL lock_timeout = '5s';

DO $hardening$
DECLARE
  relation record;
  client_role text;
  privilege_name text;
  blocked text[] := ARRAY['TRUNCATE', 'TRIGGER'];
BEGIN
  IF current_setting('server_version_num')::integer >= 170000 THEN
    blocked := array_append(blocked, 'MAINTAIN');
  END IF;

  FOR relation IN
    SELECT c.oid, c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
    ORDER BY c.relname
  LOOP
    FOREACH privilege_name IN ARRAY blocked LOOP
      EXECUTE format('REVOKE %s ON TABLE public.%I FROM PUBLIC, anon, authenticated',
                     privilege_name, relation.relname);
      FOREACH client_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
        IF has_table_privilege(client_role, relation.oid, privilege_name) THEN
          RAISE EXCEPTION 'Effective % on public.% remains for %. Review ownership, grantors and role membership.',
                          privilege_name, relation.relname, client_role;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END
$hardening$;


-- Run after reconcile-migrations-016-020.sql and harden-supabase-table-grants.sql.
-- Session roles share authenticated; application-role isolation still relies on RLS.
-- Backend service_role privileges are preserved for server-side operations.
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
