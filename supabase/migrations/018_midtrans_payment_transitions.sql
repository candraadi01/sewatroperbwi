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
