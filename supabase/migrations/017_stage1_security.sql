-- Apply after migration 016. No customer or payment data is rewritten.
CREATE OR REPLACE FUNCTION approve_booking(p_id uuid, p_note text DEFAULT '', p_expires_hours integer DEFAULT 48)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $func$
DECLARE b bookings; a payment_attempts; amount integer;
BEGIN
  IF NOT has_role(auth.uid(),'admin') OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN
    RAISE EXCEPTION 'Active admin required';
  END IF;
  SELECT * INTO b FROM bookings WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF p_expires_hours NOT BETWEEN 1 AND 720 THEN RAISE EXCEPTION 'Invalid approval expiry'; END IF;
  IF b.status <> 'pending_review' THEN RAISE EXCEPTION 'Booking is not awaiting review'; END IF;
  amount = CASE WHEN b.payment_choice='dp' THEN b.dp_amount ELSE b.total_amount END;
  INSERT INTO payment_attempts(booking_id,midtrans_order_id,purpose,expected_amount,idempotency_key,expires_at)
  VALUES(b.id,b.booking_code||'-1',b.payment_choice,amount,b.idempotency_key::text,
         now()+make_interval(hours=>p_expires_hours)) RETURNING * INTO a;
  UPDATE bookings SET status='approved', approved_at=now(), approved_by=auth.uid(),
    approval_expires_at=now()+make_interval(hours=>p_expires_hours) WHERE id=p_id;
  INSERT INTO booking_status_history(booking_id,old_status,new_status,changed_by,reason)
  VALUES(p_id,'pending_review','approved',auth.uid(),
         coalesce(nullif(p_note,''),'Kendaraan tersedia. Disetujui oleh admin. Silakan lanjutkan pembayaran.'));
  INSERT INTO notification_outbox(recipient_id,channel,subject,body)
  VALUES(b.user_id,'in_app','Booking disetujui',
    'Booking '||b.booking_code||' disetujui. Silakan bayar sebelum '||
    to_char(now()+make_interval(hours=>p_expires_hours) AT TIME ZONE 'Asia/Jakarta','DD/MM/YYYY HH24:MI')||' WIB.');
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
  UPDATE bookings SET amount_paid=n,outstanding=greatest(0,total_amount-n),status=CASE WHEN status IN ('approved','pending_payment') THEN 'payment_received'::booking_status WHEN status IN ('cancelled_by_admin','cancelled_by_buyer') THEN 'refund_pending'::booking_status ELSE status END WHERE id=b.id;
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


-- These tables predate the hardening migration. Existing rows stay in place.
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON payout_requests,offline_schedules,user_favorites FROM PUBLIC,anon,authenticated;
GRANT SELECT ON payout_requests TO authenticated;
GRANT INSERT(owner_id,amount,bank_name,account_number,account_holder),
      UPDATE(status,admin_notes,transfer_proof_url,processed_at) ON payout_requests TO authenticated;
CREATE POLICY payout_read ON payout_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR (owner_id=auth.uid() AND has_role(auth.uid(),'owner')));
CREATE POLICY payout_request ON payout_requests FOR INSERT TO authenticated
  WITH CHECK (owner_id=auth.uid() AND (has_role(auth.uid(),'owner') OR has_role(auth.uid(),'admin'))
    AND status='pending' AND processed_at IS NULL AND amount>=100000);
CREATE POLICY payout_process ON payout_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

GRANT SELECT,INSERT,UPDATE,DELETE ON offline_schedules TO authenticated;
CREATE POLICY offline_scope ON offline_schedules FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR (owner_id=auth.uid() AND has_role(auth.uid(),'owner')))
  WITH CHECK (has_role(auth.uid(),'admin') OR (owner_id=auth.uid() AND has_role(auth.uid(),'owner')));

GRANT SELECT,INSERT,DELETE ON user_favorites TO authenticated;
CREATE POLICY personal_favorites ON user_favorites FOR ALL TO authenticated
  USING (user_id=auth.uid() AND has_role(auth.uid(),'buyer'))
  WITH CHECK (user_id=auth.uid() AND has_role(auth.uid(),'buyer'));

DROP POLICY IF EXISTS blackout_admin_and_owner_all ON blackout_dates;
DROP POLICY IF EXISTS quotas_admin_and_owner_all ON sales_quotas;
CREATE POLICY blackout_admin_write ON blackout_dates FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY quotas_admin_write ON sales_quotas FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS testimonials_public_read ON testimonials;
DROP POLICY IF EXISTS testimonials_admin_write ON testimonials;
CREATE POLICY testimonials_public_read ON testimonials FOR SELECT TO anon,authenticated USING (is_active);
CREATE POLICY testimonials_admin_write ON testimonials FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS destinations_public_read ON destinations;
DROP POLICY IF EXISTS destinations_admin_write ON destinations;
CREATE POLICY destinations_public_read ON destinations FOR SELECT TO anon,authenticated USING (is_active);
CREATE POLICY destinations_admin_write ON destinations FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
