import { NextRequest, NextResponse } from 'next/server';
import { calculateQuote } from '@/lib/pricing/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.serviceDate) {
      return NextResponse.json(
        { error: 'Pilih tanggal sewa terlebih dahulu' },
        { status: 400 }
      );
    }

    const quote = await calculateQuote({
      productId: body.productId,
      productSlug: body.productSlug,
      serviceDate: body.serviceDate,
      startTime: body.startTime,
      numUnits: Number(body.numUnits) || 1,
      numPassengers: Number(body.numPassengers) || 1,
      pickupZoneId: body.pickupZoneId,
      pickupAddress: body.pickupAddress,
      promoCode: body.promoCode,
    });

    return NextResponse.json({ success: true, data: quote });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghitung penawaran harga';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
