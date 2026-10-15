-- Additive repair. Apply after 001–003; never rerun old migrations on production.
ALTER TABLE products ADD COLUMN IF NOT EXISTS cover_image_url text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS dp_override_percentage integer CHECK(dp_override_percentage BETWEEN 1 AND 10000);
ALTER TABLE products ADD COLUMN IF NOT EXISTS default_start_time time NOT NULL DEFAULT '08:00';
ALTER TABLE business_settings_versions ADD COLUMN IF NOT EXISTS default_dp_nominal integer NOT NULL DEFAULT 300000 CHECK(default_dp_nominal>0);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS idempotency_key uuid UNIQUE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS request_hash text;
CREATE OR REPLACE FUNCTION has_role(check_user_id uuid,check_role app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM user_roles ur JOIN profiles p ON p.id=ur.user_id WHERE ur.user_id=check_user_id AND ur.role=check_role AND p.account_status='active');
$$;
GRANT EXECUTE ON FUNCTION has_role(uuid,app_role) TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS one_booking_per_quote ON bookings(quote_id);
CREATE UNIQUE INDEX IF NOT EXISTS one_payment_credit_per_attempt ON payment_ledger(payment_attempt_id) WHERE entry_type='payment';

-- Profiles contain private contact data, not a public directory.
DROP POLICY IF EXISTS profiles_public_read ON profiles;
CREATE POLICY profiles_owner_read ON profiles FOR SELECT TO authenticated USING(id=auth.uid());
CREATE OR REPLACE FUNCTION protect_profile_fields() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') AND
   (NEW.account_status IS DISTINCT FROM OLD.account_status OR NEW.email IS DISTINCT FROM OLD.email OR NEW.id IS DISTINCT FROM OLD.id) THEN
   RAISE EXCEPTION 'Protected profile fields';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_profile_before_update BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION protect_profile_fields();

-- Direct buyer writes must never create their own price/payment snapshots.
DROP POLICY IF EXISTS quotes_owner_insert ON quotes;
DROP POLICY IF EXISTS bookings_owner_insert ON bookings;
DROP POLICY IF EXISTS bookings_admin_all ON bookings;
CREATE POLICY bookings_admin_read ON bookings FOR SELECT TO authenticated USING(has_role(auth.uid(),'admin'));
-- Only validated status RPCs and server-side booking creation can write bookings.
DROP POLICY IF EXISTS change_requests_owner_insert ON change_requests;
CREATE POLICY change_requests_verified_insert ON change_requests FOR INSERT TO authenticated
 WITH CHECK(requested_by=auth.uid() AND status='pending' AND reviewed_by IS NULL AND reviewed_at IS NULL AND
 EXISTS(SELECT 1 FROM bookings b WHERE b.id=booking_id AND b.user_id=auth.uid()));
DROP POLICY IF EXISTS notifications_owner_update ON notification_outbox;
DROP POLICY IF EXISTS payments_admin_all ON payment_attempts;
CREATE POLICY payments_admin_read ON payment_attempts FOR SELECT TO authenticated USING(has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS ledger_admin_all ON payment_ledger;
CREATE POLICY ledger_admin_read ON payment_ledger FOR SELECT TO authenticated USING(has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS webhook_admin_only ON webhook_events;
CREATE POLICY webhook_admin_read ON webhook_events FOR SELECT TO authenticated USING(has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS audit_admin_only ON audit_logs;
CREATE POLICY audit_admin_read ON audit_logs FOR SELECT TO authenticated USING(has_role(auth.uid(),'admin'));

CREATE TABLE booking_admin_notes(
 id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id),
 note text NOT NULL DEFAULT '',updated_by uuid REFERENCES profiles(id),updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE booking_admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY booking_admin_notes_access ON booking_admin_notes FOR ALL TO authenticated USING(has_role(auth.uid(),'admin')) WITH CHECK(has_role(auth.uid(),'admin'));
INSERT INTO booking_admin_notes(booking_id,note) SELECT id,admin_notes FROM bookings WHERE coalesce(admin_notes,'')<>'';
UPDATE bookings SET admin_notes='' WHERE coalesce(admin_notes,'')<>'';
CREATE OR REPLACE FUNCTION protect_booking_finances() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.admin_notes<>'' THEN RAISE EXCEPTION 'Use private booking_admin_notes'; END IF;
 IF auth.uid() IS NOT NULL AND (NEW.amount_paid IS DISTINCT FROM OLD.amount_paid OR NEW.outstanding IS DISTINCT FROM OLD.outstanding OR
 NEW.total_amount IS DISTINCT FROM OLD.total_amount OR NEW.dp_amount IS DISTINCT FROM OLD.dp_amount OR NEW.user_id IS DISTINCT FROM OLD.user_id OR
 NEW.price_snapshot IS DISTINCT FROM OLD.price_snapshot OR NEW.product_snapshot IS DISTINCT FROM OLD.product_snapshot OR NEW.quote_id IS DISTINCT FROM OLD.quote_id) THEN
 RAISE EXCEPTION 'Financial snapshots are server-managed'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_booking_finances_before_update BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION protect_booking_finances();

-- Persistent rate limits, never process-local serverless memory.
CREATE TABLE app_rate_limits(key text PRIMARY KEY, hits integer NOT NULL,expires_at timestamptz NOT NULL);
ALTER TABLE app_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION consume_rate_limit(p_key text,p_limit integer,p_seconds integer) RETURNS boolean
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer;
BEGIN
 INSERT INTO app_rate_limits(key,hits,expires_at) VALUES(p_key,1,now()+make_interval(secs=>p_seconds))
 ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN app_rate_limits.expires_at<now() THEN 1 ELSE app_rate_limits.hits+1 END,
 expires_at=CASE WHEN app_rate_limits.expires_at<now() THEN now()+make_interval(secs=>p_seconds) ELSE app_rate_limits.expires_at END RETURNING hits INTO n;
 RETURN n<=p_limit;
END $$;
REVOKE ALL ON FUNCTION consume_rate_limit(text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION consume_rate_limit(text,integer,integer) TO service_role;

CREATE OR REPLACE FUNCTION reserve_booking(p jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old bookings; q quotes; b bookings; a payment_attempts; product products; promo promos; quota sales_quotas; amount integer; code text;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p->>'idempotency_key',0));
 SELECT * INTO old FROM bookings WHERE idempotency_key=(p->>'idempotency_key')::uuid;
 IF FOUND THEN
  IF old.user_id<>(p->>'user_id')::uuid OR old.request_hash<>p->>'request_hash' THEN RAISE EXCEPTION 'Idempotency conflict';END IF;
  SELECT * INTO a FROM payment_attempts WHERE booking_id=old.id ORDER BY created_at LIMIT 1;
  RETURN jsonb_build_object('booking',to_jsonb(old),'attempt',to_jsonb(a));
 END IF;
 SELECT * INTO product FROM products WHERE id=(p->>'product_id')::uuid FOR SHARE;
 IF NOT FOUND OR product.status<>'active' OR product.is_sample_data OR NOT product.is_owner_approved THEN RAISE EXCEPTION 'Product not approved';END IF;
 IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=(p->>'user_id')::uuid AND account_status='active') THEN RAISE EXCEPTION 'Account unavailable';END IF;
 IF (p->>'num_passengers')::integer>product.passenger_capacity*(p->>'num_units')::integer THEN RAISE EXCEPTION 'Capacity exceeded';END IF;
 SELECT * INTO quota FROM sales_quotas WHERE product_id=product.id AND date=(p->>'service_date')::date FOR UPDATE;
 IF FOUND THEN
  IF quota.booked_units+(p->>'num_units')::integer>quota.max_units THEN RAISE EXCEPTION 'Sales quota exceeded';END IF;
  UPDATE sales_quotas SET booked_units=booked_units+(p->>'num_units')::integer WHERE id=quota.id;
 END IF;
 IF nullif(p->>'promo_id','') IS NOT NULL THEN
  SELECT * INTO promo FROM promos WHERE id=(p->>'promo_id')::uuid FOR UPDATE;
  IF NOT FOUND OR NOT promo.is_active OR now() NOT BETWEEN promo.valid_from AND promo.valid_until OR
   (promo.total_quota IS NOT NULL AND promo.used_count>=promo.total_quota) OR
   (SELECT count(*) FROM promo_redemptions WHERE promo_id=promo.id AND user_id=(p->>'user_id')::uuid)>=coalesce(promo.per_buyer_limit,2147483647)
   THEN RAISE EXCEPTION 'Promo unavailable';END IF;
  UPDATE promos SET used_count=used_count+1 WHERE id=promo.id;
 END IF;
 INSERT INTO quotes(user_id,product_id,service_date,start_time,duration_minutes,num_units,num_passengers,pickup_zone_id,pickup_address,promo_id,promo_code,base_price,pickup_cost,subtotal,discount_amount,total_amount,dp_amount,dp_percentage,expires_at,is_used,price_snapshot,product_snapshot,terms_snapshot)
 VALUES((p->>'user_id')::uuid,product.id,(p->>'service_date')::date,(p->>'start_time')::time,product.duration_minutes,(p->>'num_units')::integer,(p->>'num_passengers')::integer,nullif(p->>'pickup_zone_id','')::uuid,p->>'pickup_address',promo.id,p->>'promo_code',(p->>'base_price')::integer,(p->>'pickup_cost')::integer,(p->>'subtotal')::integer,(p->>'discount_amount')::integer,(p->>'total_amount')::integer,(p->>'dp_amount')::integer,(p->>'dp_percentage')::integer,now()+interval '15 minutes',true,p->'price_snapshot',p->'product_snapshot',p->'terms_snapshot') RETURNING * INTO q;
 code='TRP-'||to_char(now() AT TIME ZONE 'Asia/Jakarta','YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
 INSERT INTO bookings(booking_code,user_id,quote_id,product_id,service_date,start_time,duration_minutes,num_units,num_passengers,pickup_zone_id,pickup_address,contact_name,contact_phone,contact_email,notes,subtotal,discount_amount,total_amount,dp_amount,outstanding,payment_choice,terms_version,promo_id,promo_code,price_snapshot,product_snapshot,terms_snapshot,confirmation_deadline,idempotency_key,request_hash)
 VALUES(code,q.user_id,q.id,q.product_id,q.service_date,q.start_time,q.duration_minutes,q.num_units,q.num_passengers,q.pickup_zone_id,q.pickup_address,p->>'contact_name',p->>'contact_phone',p->>'contact_email',p->>'notes',q.subtotal,q.discount_amount,q.total_amount,q.dp_amount,q.total_amount,(p->>'payment_choice')::payment_purpose,product.terms_version,q.promo_id,q.promo_code,q.price_snapshot,q.product_snapshot,q.terms_snapshot,now()+make_interval(hours=>(p->>'confirmation_hours')::integer),(p->>'idempotency_key')::uuid,p->>'request_hash') RETURNING * INTO b;
 IF promo.id IS NOT NULL THEN INSERT INTO promo_redemptions(promo_id,user_id,booking_id) VALUES(promo.id,b.user_id,b.id);END IF;
 amount=CASE WHEN b.payment_choice='dp' THEN b.dp_amount ELSE b.total_amount END;
 INSERT INTO payment_attempts(booking_id,midtrans_order_id,purpose,expected_amount,idempotency_key,expires_at) VALUES(b.id,code||'-1',b.payment_choice,amount,p->>'idempotency_key',now()+interval '1 day') RETURNING * INTO a;
 RETURN jsonb_build_object('booking',to_jsonb(b),'attempt',to_jsonb(a));
END $$;
REVOKE ALL ON FUNCTION reserve_booking(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION reserve_booking(jsonb) TO service_role;

CREATE OR REPLACE FUNCTION apply_midtrans_event(p jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a payment_attempts;b bookings;ev uuid;n integer;s text;success boolean;
BEGIN
 SELECT * INTO a FROM payment_attempts WHERE midtrans_order_id=p->>'order_id' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown payment order';END IF;
 SELECT * INTO b FROM bookings WHERE id=a.booking_id FOR UPDATE;
 IF (p->>'gross_amount')::numeric<>a.expected_amount THEN RAISE EXCEPTION 'Amount mismatch';END IF;
 s=p->>'transaction_status';success=(s='settlement' AND coalesce(p->>'fraud_status','accept')='accept') OR (s='capture' AND p->>'fraud_status'='accept');
 INSERT INTO webhook_events(provider,event_id,order_id,raw_payload,signature_valid,processed) VALUES('midtrans',p->>'event_id',a.midtrans_order_id,p,true,false) ON CONFLICT(provider,event_id) DO NOTHING RETURNING id INTO ev;
 IF ev IS NULL THEN RETURN jsonb_build_object('duplicate',true);END IF;
 IF success THEN
  INSERT INTO payment_ledger(booking_id,payment_attempt_id,entry_type,amount,balance_after,description) VALUES(b.id,a.id,'payment',a.expected_amount,b.amount_paid+a.expected_amount,'Midtrans verified') ON CONFLICT(payment_attempt_id) WHERE entry_type='payment' DO NOTHING;
  SELECT coalesce(sum(amount),0)::integer INTO n FROM payment_ledger WHERE booking_id=b.id AND entry_type='payment';
  UPDATE payment_attempts SET status=CASE WHEN s='capture' THEN 'captured'::payment_attempt_status ELSE 'settlement'::payment_attempt_status END,paid_amount=expected_amount,midtrans_transaction_id=p->>'transaction_id',fraud_status=coalesce(p->>'fraud_status','') WHERE id=a.id;
  UPDATE bookings SET amount_paid=n,outstanding=greatest(0,total_amount-n),status=CASE WHEN status='pending_payment' THEN 'payment_received'::booking_status WHEN status IN ('cancelled_by_admin','cancelled_by_buyer') THEN 'refund_pending'::booking_status ELSE status END WHERE id=b.id;
 ELSIF s IN ('refund','partial_refund') THEN
  -- Record for reconciliation. Never invent refund amounts from original gross_amount.
  UPDATE bookings SET status='refund_pending' WHERE id=b.id AND status<>'refunded';
 ELSIF a.paid_amount=0 AND a.status NOT IN ('captured','settlement','refund','partial_refund') THEN
  UPDATE payment_attempts SET status=CASE WHEN s IN ('capture','authorize') THEN 'authorized'::payment_attempt_status ELSE s::payment_attempt_status END WHERE id=a.id;
 END IF;
 UPDATE webhook_events SET processed=true,processed_at=now(),process_result=CASE WHEN success THEN 'credited' ELSE s END WHERE id=ev;
 RETURN jsonb_build_object('processed',true,'booking_code',b.booking_code);
END $$;
REVOKE ALL ON FUNCTION apply_midtrans_event(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION apply_midtrans_event(jsonb) TO service_role;

CREATE OR REPLACE FUNCTION set_booking_status(p_id uuid,p_status booking_status,p_note text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b bookings;
BEGIN
 IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN RAISE EXCEPTION 'Admin required';END IF;
 SELECT * INTO b FROM bookings WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found';END IF;
 IF NOT ((b.status='pending_payment' AND p_status='cancelled_by_admin') OR (b.status='payment_received' AND p_status IN ('confirmed','cancelled_by_admin')) OR (b.status='confirmed' AND p_status IN ('in_progress','cancelled_by_admin')) OR (b.status='in_progress' AND p_status='completed')) THEN RAISE EXCEPTION 'Invalid booking transition';END IF;
 IF p_status='confirmed' AND b.amount_paid<1 THEN RAISE EXCEPTION 'Payment required';END IF;
 UPDATE bookings SET status=p_status,confirmed_by=CASE WHEN p_status='confirmed' THEN auth.uid() ELSE confirmed_by END,confirmed_at=CASE WHEN p_status='confirmed' THEN now() ELSE confirmed_at END WHERE id=p_id;
 IF p_status='cancelled_by_admin' THEN
  UPDATE sales_quotas SET booked_units=greatest(0,booked_units-b.num_units) WHERE product_id=b.product_id AND date=b.service_date;
 END IF;
 INSERT INTO booking_status_history(booking_id,old_status,new_status,changed_by,reason) VALUES(p_id,b.status,p_status,auth.uid(),left(p_note,1000));
END $$;
REVOKE ALL ON FUNCTION set_booking_status(uuid,booking_status,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION set_booking_status(uuid,booking_status,text) TO authenticated;

CREATE OR REPLACE FUNCTION audit_admin_changes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NOT NULL AND has_role(auth.uid(),'admin') THEN
 INSERT INTO audit_logs(user_id,action,entity_type,entity_id,old_data,new_data) VALUES(auth.uid(),TG_OP,TG_TABLE_NAME,NEW.id,CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) ELSE NULL END,to_jsonb(NEW));
 END IF;RETURN NEW;
END $$;
DO $$ DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['products','pricing_rules','site_settings','faqs','pages','articles','promos','pickup_zones','landing_sections','menus','business_settings_versions'] LOOP
 EXECUTE format('CREATE TRIGGER audit_admin_change AFTER INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION audit_admin_changes()',t);
END LOOP;END $$;

-- Operational defaults; existing owner values are preserved.
INSERT INTO site_settings(key,value,category) VALUES
 ('hero_title','"Banyuwangi,\ndari dekat."','appearance'),
 ('hero_description','"Pilih rute perjalananmu. Kami bantu menyiapkan Jeep Trooper dan kebutuhan sewanya."','appearance'),
 ('hero_image','"/images/trooper-reference.jpg"','appearance'),
 ('office_hours','"Hubungi admin untuk jadwal layanan."','contact') ON CONFLICT(key) DO NOTHING;
