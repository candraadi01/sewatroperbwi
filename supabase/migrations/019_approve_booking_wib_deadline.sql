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
