-- 006_approval_workflow.sql
-- Additive migration: adds admin-approval step before payment.
-- SAFE: Never run prisma migrate reset. Apply on existing production DB only.

-- 1. Extend booking_status enum with new values (idempotent)
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending_review';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'approved';

-- 2. Add approval tracking columns to bookings (idempotent)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approval_expires_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejected_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason text NOT NULL DEFAULT '';

-- 3. reserve_booking: store booking with status=pending_review, no payment_attempt yet
CREATE OR REPLACE FUNCTION reserve_booking(p jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $func$
DECLARE
  old bookings; q quotes; b bookings; product products; promo promos;
  quota sales_quotas; code text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p->>'idempotency_key',0));
  SELECT * INTO old FROM bookings WHERE idempotency_key=(p->>'idempotency_key')::uuid;
  IF FOUND THEN
    IF old.user_id<>(p->>'user_id')::uuid OR old.request_hash<>p->>'request_hash' THEN
      RAISE EXCEPTION 'Idempotency conflict';
    END IF;
    RETURN jsonb_build_object('booking',to_jsonb(old),'attempt',NULL);
  END IF;
  SELECT * INTO product FROM products WHERE id=(p->>'product_id')::uuid FOR SHARE;
  IF NOT FOUND OR product.status<>'active' OR product.is_sample_data OR NOT product.is_owner_approved THEN
    RAISE EXCEPTION 'Product not approved';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=(p->>'user_id')::uuid AND account_status='active') THEN
    RAISE EXCEPTION 'Account unavailable';
  END IF;
  IF (p->>'num_passengers')::integer>product.passenger_capacity*(p->>'num_units')::integer THEN
    RAISE EXCEPTION 'Capacity exceeded';
  END IF;
  SELECT * INTO quota FROM sales_quotas WHERE product_id=product.id AND date=(p->>'service_date')::date FOR UPDATE;
  IF FOUND THEN
    IF quota.booked_units+(p->>'num_units')::integer>quota.max_units THEN RAISE EXCEPTION 'Sales quota exceeded'; END IF;
    UPDATE sales_quotas SET booked_units=booked_units+(p->>'num_units')::integer WHERE id=quota.id;
  END IF;
  IF nullif(p->>'promo_id','') IS NOT NULL THEN
    SELECT * INTO promo FROM promos WHERE id=(p->>'promo_id')::uuid FOR UPDATE;
    IF NOT FOUND OR NOT promo.is_active OR now() NOT BETWEEN promo.valid_from AND promo.valid_until OR
       (promo.total_quota IS NOT NULL AND promo.used_count>=promo.total_quota) OR
       (SELECT count(*) FROM promo_redemptions WHERE promo_id=promo.id AND user_id=(p->>'user_id')::uuid)>=coalesce(promo.per_buyer_limit,2147483647)
      THEN RAISE EXCEPTION 'Promo unavailable';
    END IF;
    UPDATE promos SET used_count=used_count+1 WHERE id=promo.id;
  END IF;
  INSERT INTO quotes(user_id,product_id,service_date,start_time,duration_minutes,num_units,num_passengers,
    pickup_zone_id,pickup_address,promo_id,promo_code,base_price,pickup_cost,subtotal,discount_amount,
    total_amount,dp_amount,dp_percentage,expires_at,is_used,price_snapshot,product_snapshot,terms_snapshot)
  VALUES((p->>'user_id')::uuid,product.id,(p->>'service_date')::date,(p->>'start_time')::time,
    product.duration_minutes,(p->>'num_units')::integer,(p->>'num_passengers')::integer,
    nullif(p->>'pickup_zone_id','')::uuid,p->>'pickup_address',promo.id,p->>'promo_code',
    (p->>'base_price')::integer,(p->>'pickup_cost')::integer,(p->>'subtotal')::integer,
    (p->>'discount_amount')::integer,(p->>'total_amount')::integer,(p->>'dp_amount')::integer,
    (p->>'dp_percentage')::integer,now()+interval '15 minutes',true,
    p->'price_snapshot',p->'product_snapshot',p->'terms_snapshot') RETURNING * INTO q;
  code='TRP-'||to_char(now() AT TIME ZONE 'Asia/Jakarta','YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
  INSERT INTO bookings(booking_code,user_id,quote_id,product_id,service_date,start_time,duration_minutes,
    num_units,num_passengers,pickup_zone_id,pickup_address,contact_name,contact_phone,contact_email,notes,
    subtotal,discount_amount,total_amount,dp_amount,outstanding,payment_choice,terms_version,promo_id,
    promo_code,price_snapshot,product_snapshot,terms_snapshot,confirmation_deadline,idempotency_key,request_hash,status)
  VALUES(code,q.user_id,q.id,q.product_id,q.service_date,q.start_time,q.duration_minutes,
    q.num_units,q.num_passengers,q.pickup_zone_id,q.pickup_address,p->>'contact_name',p->>'contact_phone',
    p->>'contact_email',p->>'notes',q.subtotal,q.discount_amount,q.total_amount,q.dp_amount,q.total_amount,
    (p->>'payment_choice')::payment_purpose,product.terms_version,q.promo_id,q.promo_code,
    q.price_snapshot,q.product_snapshot,q.terms_snapshot,
    now()+make_interval(hours=>(p->>'confirmation_hours')::integer),
    (p->>'idempotency_key')::uuid,p->>'request_hash','pending_review') RETURNING * INTO b;
  IF promo.id IS NOT NULL THEN
    INSERT INTO promo_redemptions(promo_id,user_id,booking_id) VALUES(promo.id,b.user_id,b.id);
  END IF;
  INSERT INTO booking_status_history(booking_id,old_status,new_status,changed_by,reason)
  VALUES(b.id,NULL,'pending_review',b.user_id,'Booking submitted by buyer');
  RETURN jsonb_build_object('booking',to_jsonb(b),'attempt',NULL);
END $func$;
REVOKE ALL ON FUNCTION reserve_booking(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION reserve_booking(jsonb) TO service_role;

-- 4. approve_booking: admin approves, creates payment_attempt, buyer can now pay
CREATE OR REPLACE FUNCTION approve_booking(p_id uuid, p_note text DEFAULT '', p_expires_hours integer DEFAULT 48)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $func$
DECLARE b bookings; a payment_attempts; amount integer;
BEGIN
  IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN
    RAISE EXCEPTION 'Admin required';
  END IF;
  SELECT * INTO b FROM bookings WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF b.status <> 'pending_review' THEN RAISE EXCEPTION 'Booking is not awaiting review'; END IF;
  amount = CASE WHEN b.payment_choice='dp' THEN b.dp_amount ELSE b.total_amount END;
  INSERT INTO payment_attempts(booking_id,midtrans_order_id,purpose,expected_amount,idempotency_key,expires_at)
  VALUES(b.id,b.booking_code||'-1',b.payment_choice,amount,b.idempotency_key::text,
         now()+make_interval(hours=>p_expires_hours)) RETURNING * INTO a;
  UPDATE bookings SET status='approved', approved_at=now(), approved_by=auth.uid(),
    approval_expires_at=now()+make_interval(hours=>p_expires_hours) WHERE id=p_id;
  INSERT INTO booking_status_history(booking_id,old_status,new_status,changed_by,reason)
  VALUES(p_id,'pending_review','approved',auth.uid(),
         coalesce(nullif(p_note,''),'Kendaraan tersedia. Silakan lanjutkan pembayaran.'));
  INSERT INTO notification_outbox(recipient_id,channel,subject,body)
  VALUES(b.user_id,'in_app','Booking disetujui',
    'Booking '||b.booking_code||' disetujui. Silakan bayar sebelum '||
    to_char(now()+make_interval(hours=>p_expires_hours) AT TIME ZONE 'Asia/Jakarta','DD/MM/YYYY HH24:MI')||' WIB.');
  RETURN jsonb_build_object('booking_code',b.booking_code,'amount',amount,'expires_hours',p_expires_hours);
END $func$;
REVOKE ALL ON FUNCTION approve_booking(uuid,text,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION approve_booking(uuid,text,integer) TO authenticated;

-- 5. reject_booking: admin rejects, frees quota, notifies buyer
CREATE OR REPLACE FUNCTION reject_booking(p_id uuid, p_reason text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $func$
DECLARE b bookings;
BEGIN
  IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN
    RAISE EXCEPTION 'Admin required';
  END IF;
  SELECT * INTO b FROM bookings WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF b.status NOT IN ('pending_review','approved') THEN
    RAISE EXCEPTION 'Cannot reject booking with current status';
  END IF;
  UPDATE sales_quotas SET booked_units=greatest(0,booked_units-b.num_units)
    WHERE product_id=b.product_id AND date=b.service_date;
  UPDATE bookings SET status='cancelled_by_admin', rejected_at=now(),
    rejection_reason=coalesce(nullif(p_reason,''),'Kendaraan tidak tersedia.') WHERE id=p_id;
  INSERT INTO booking_status_history(booking_id,old_status,new_status,changed_by,reason)
  VALUES(p_id,b.status,'cancelled_by_admin',auth.uid(),
         left(coalesce(nullif(p_reason,''),'Kendaraan tidak tersedia.'),1000));
  INSERT INTO notification_outbox(recipient_id,channel,subject,body)
  VALUES(b.user_id,'in_app','Booking tidak dapat diproses',
    'Booking '||b.booking_code||' tidak dapat diproses: '||
    coalesce(nullif(p_reason,''),'Kendaraan tidak tersedia untuk tanggal yang dipilih.'));
END $func$;
REVOKE ALL ON FUNCTION reject_booking(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION reject_booking(uuid,text) TO authenticated;

-- 6. Updated set_booking_status with new status transitions
CREATE OR REPLACE FUNCTION set_booking_status(p_id uuid, p_status booking_status, p_note text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $func$
DECLARE b bookings;
BEGIN
  IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN
    RAISE EXCEPTION 'Admin required';
  END IF;
  SELECT * INTO b FROM bookings WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF NOT (
    (b.status='pending_review' AND p_status='cancelled_by_admin') OR
    (b.status='approved' AND p_status IN ('pending_payment','cancelled_by_admin')) OR
    (b.status='pending_payment' AND p_status='cancelled_by_admin') OR
    (b.status='payment_received' AND p_status IN ('confirmed','cancelled_by_admin')) OR
    (b.status='confirmed' AND p_status IN ('in_progress','cancelled_by_admin')) OR
    (b.status='in_progress' AND p_status='completed')
  ) THEN RAISE EXCEPTION 'Invalid booking transition from % to %', b.status, p_status; END IF;
  IF p_status='confirmed' AND b.amount_paid<1 THEN RAISE EXCEPTION 'Payment required before confirming'; END IF;
  UPDATE bookings SET status=p_status,
    confirmed_by=CASE WHEN p_status='confirmed' THEN auth.uid() ELSE confirmed_by END,
    confirmed_at=CASE WHEN p_status='confirmed' THEN now() ELSE confirmed_at END
  WHERE id=p_id;
  IF p_status='cancelled_by_admin' THEN
    UPDATE sales_quotas SET booked_units=greatest(0,booked_units-b.num_units)
      WHERE product_id=b.product_id AND date=b.service_date;
  END IF;
  INSERT INTO booking_status_history(booking_id,old_status,new_status,changed_by,reason)
  VALUES(p_id,b.status,p_status,auth.uid(),left(p_note,1000));
END $func$;
REVOKE ALL ON FUNCTION set_booking_status(uuid,booking_status,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION set_booking_status(uuid,booking_status,text) TO authenticated;
