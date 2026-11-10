import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/helpers";
import {
  setDateAvailability,
  bulkSetDateAvailability,
  updateProductDepartureSettings,
} from "@/lib/services/schedule";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user || (!user.roles.includes("admin") && !user.roles.includes("owner"))) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak: Hanya Admin dan Pemilik yang dapat mengatur jadwal." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Jika admin/owner hanya ingin memperbarui jam keberangkatan katalog produk
    if (body.action === "update_departure_time" && body.productId && body.defaultStartTime) {
      const res = await updateProductDepartureSettings(body.productId, String(body.defaultStartTime).trim());
      return NextResponse.json(res);
    }

    if (Array.isArray(body.dates) && body.dates.length > 0) {
      const res = await bulkSetDateAvailability({
        dates: body.dates,
        isAvailable: Boolean(body.isAvailable),
        reason: body.reason,
        maxUnits: typeof body.maxUnits === "number" ? body.maxUnits : undefined,
        productId: body.productId || undefined,
      });
      return NextResponse.json({
        success: true,
        message: `Berhasil memperbarui ${res.count} tanggal jadwal secara massal.`,
      });
    }

    if (!body.date) {
      return NextResponse.json(
        { success: false, error: "Parameter tanggal wajib diisi." },
        { status: 400 }
      );
    }

    // Jika ada update jam keberangkatan bersamaan dengan toggle
    if (body.productId && typeof body.defaultStartTime === "string" && body.defaultStartTime.trim()) {
      try {
        await updateProductDepartureSettings(body.productId, body.defaultStartTime.trim());
      } catch (err) {
        console.warn("[toggle] Warning updating departure time:", err);
      }
    }

    const res = await setDateAvailability({
      date: body.date,
      isAvailable: Boolean(body.isAvailable),
      reason: body.reason,
      maxUnits: typeof body.maxUnits === "number" ? body.maxUnits : undefined,
      productId: body.productId || undefined,
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("[API admin/schedule/toggle] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal memperbarui status ketersediaan jadwal.",
      },
      { status: 500 }
    );
  }
}
