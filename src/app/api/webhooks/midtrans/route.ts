import { NextRequest, NextResponse } from 'next/server';
import { verifyMidtransSignature } from '@/lib/midtrans/snap';
import { getBookingById, updateBookingPaymentStatus } from '@/lib/services/booking';

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notification;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID tidak ditemukan' }, { status: 400 });
    }

    // Verifikasi tanda tangan jika ada signature_key dan bukan mode lokal tanpa key
    if (signature_key && process.env.MIDTRANS_SERVER_KEY && !process.env.MIDTRANS_SERVER_KEY.includes('placeholder')) {
      const isValid = verifyMidtransSignature(order_id, status_code, gross_amount, signature_key);
      if (!isValid) {
        console.warn(`[Midtrans Webhook] Invalid signature key for order ${order_id}`);
        return NextResponse.json({ error: 'Signature key tidak valid' }, { status: 403 });
      }
    }

    const booking = await getBookingById(order_id);
    if (!booking) {
      console.warn(`[Midtrans Webhook] Booking ${order_id} tidak ditemukan`);
      return NextResponse.json({ message: 'Booking tidak ditemukan, dicatat' }, { status: 200 });
    }

    // Idempotent state machine transition
    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        await updateBookingPaymentStatus(order_id, 'unpaid', 'pending_payment');
      } else if (fraud_status === 'accept') {
        const nextPaymentStatus = booking.payment_choice === 'dp' ? 'dp_paid' : 'settlement';
        await updateBookingPaymentStatus(order_id, nextPaymentStatus, 'confirmed');
      }
    } else if (transaction_status === 'settlement') {
      const nextPaymentStatus = booking.payment_choice === 'dp' ? 'dp_paid' : 'settlement';
      await updateBookingPaymentStatus(order_id, nextPaymentStatus, 'confirmed');
    } else if (transaction_status === 'pending') {
      await updateBookingPaymentStatus(order_id, 'unpaid', 'pending_payment');
    } else if (['deny', 'cancel', 'expire'].includes(transaction_status)) {
      await updateBookingPaymentStatus(order_id, 'cancel', 'cancelled');
    }

    return NextResponse.json({ status: 'ok', message: 'Notifikasi berhasil diproses' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error processing webhook';
    console.error('[Midtrans Webhook Error]:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
