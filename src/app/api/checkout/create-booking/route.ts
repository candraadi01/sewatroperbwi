import { NextRequest, NextResponse } from 'next/server';
import { calculateQuote } from '@/lib/pricing/engine';
import { createSnapTransaction } from '@/lib/midtrans/snap';
import { saveBooking, BookingRecord } from '@/lib/services/booking';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      productSlug,
      productId,
      serviceDate,
      startTime,
      numUnits,
      numPassengers,
      pickupZoneId,
      pickupAddress,
      promoCode,
      contactName,
      contactPhone,
      contactEmail,
      paymentChoice,
      termsAccepted,
      notes,
    } = body;

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'Anda harus menyetujui Syarat dan Ketentuan untuk melanjutkan' },
        { status: 400 }
      );
    }

    if (!contactName || !contactPhone || !contactEmail) {
      return NextResponse.json(
        { error: 'Mohon lengkapi data nama, nomor WhatsApp/telepon, dan email' },
        { status: 400 }
      );
    }

    // Server-side authoritative price recalculation (tamper-proof!)
    const verifiedQuote = await calculateQuote({
      productId,
      productSlug,
      serviceDate,
      startTime,
      numUnits: Number(numUnits) || 1,
      numPassengers: Number(numPassengers) || 1,
      pickupZoneId,
      pickupAddress,
      promoCode,
    });

    const isDp = paymentChoice === 'dp';
    const amountToPay = isDp ? verifiedQuote.dp_amount : verifiedQuote.total_amount;
    const remainingAmount = verifiedQuote.total_amount - amountToPay;

    // Generate Order ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingId = `BWI-${dateStr}-${randomHex}`;

    // Item details for Midtrans
    const items = [
      {
        id: verifiedQuote.product_id,
        name: isDp
          ? `DP 30%: ${verifiedQuote.product_name}`
          : verifiedQuote.product_name,
        price: amountToPay,
        quantity: 1,
      },
    ];

    // Create Snap Transaction
    const snapResult = await createSnapTransaction({
      orderId: bookingId,
      grossAmount: amountToPay,
      customerName: contactName,
      customerEmail: contactEmail,
      customerPhone: contactPhone,
      items,
    });

    // Save booking
    const booking: BookingRecord = {
      id: bookingId,
      quote_id: verifiedQuote.quote_id,
      product_id: verifiedQuote.product_id,
      product_name: verifiedQuote.product_name,
      service_date: verifiedQuote.service_date,
      num_units: verifiedQuote.num_units,
      num_passengers: verifiedQuote.num_passengers,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      pickup_zone_name: verifiedQuote.pickup_zone?.name,
      pickup_address: pickupAddress || '',
      payment_choice: isDp ? 'dp' : 'full',
      total_amount: verifiedQuote.total_amount,
      amount_to_pay: amountToPay,
      remaining_amount: remainingAmount,
      payment_status: 'unpaid',
      booking_status: 'pending_payment',
      snap_token: snapResult.token,
      notes: notes || '',
      created_at: new Date().toISOString(),
    };

    await saveBooking(booking);

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        snapToken: snapResult.token,
        redirectUrl: snapResult.redirect_url,
        isSimulated: snapResult.is_simulated,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat pesanan';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
