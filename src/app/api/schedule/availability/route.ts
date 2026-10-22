import { NextResponse } from "next/server";
import { getScheduleRange } from "@/lib/services/schedule";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const defaultStart = today.toISOString().slice(0, 10);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 45);
    const defaultEnd = futureDate.toISOString().slice(0, 10);

    const start = searchParams.get("start") || defaultStart;
    const end = searchParams.get("end") || defaultEnd;
    const productId = searchParams.get("productId") || undefined;

    const data = await getScheduleRange(start, end, productId);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[API schedule/availability] Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat jadwal ketersediaan." },
      { status: 500 }
    );
  }
}
