-- 013_owner_approval_workflow.sql
-- Allow both Admin and Owner to approve and reject bookings

CREATE OR REPLACE FUNCTION approve_booking(p_id uuid, p_note text DEFAULT '', p_expires_hours integer DEFAULT 48)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $func$
DECLARE b bookings; a payment_attempts; amount integer;
BEGIN
  IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'owner')) OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN
    RAISE EXCEPTION 'Admin or Owner role required';
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
         coalesce(nullif(p_note,''),'Kendaraan tersedia. Disetujui oleh pengelola/pemilik. Silakan lanjutkan pembayaran.'));
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
  IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'owner')) OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND account_status='active') THEN
    RAISE EXCEPTION 'Admin or Owner role required';
  END IF;
  SELECT * INTO b FROM bookings WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF b.status NOT IN ('pending_review','approved') THEN
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
