import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface DateScheduleItem {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  reason?: string;
  bookedUnits: number;
  maxUnits: number;
  blackoutId?: string;
  quotaId?: string;
}

/**
 * Mengambil ketersediaan jadwal tanggal trip dalam rentang tertentu.
 * Dapat dipanggil secara publik (misal untuk homepage HeroSearch & BookingWidget).
 */
export async function getScheduleRange(
  startDate: string,
  endDate: string,
  productId?: string
): Promise<DateScheduleItem[]> {
  if (!isSupabaseConfigured()) {
    return generateDefaultSchedule(startDate, endDate);
  }

  try {
    const supabase = createPublicClient();

    // 1. Ambil blackout dates (tanggal ditutup)
    let blackoutQuery = supabase
      .from("blackout_dates")
      .select("id, product_id, date, reason")
      .gte("date", startDate)
      .lte("date", endDate);

    if (productId) {
      blackoutQuery = blackoutQuery.or(`product_id.is.null,product_id.eq.${productId}`);
    } else {
      blackoutQuery = blackoutQuery.is("product_id", null);
    }

    // 2. Ambil sales quotas (kapasitas harian)
    const quotaQuery = supabase
      .from("sales_quotas")
      .select("id, product_id, date, max_units, booked_units")
      .gte("date", startDate)
      .lte("date", endDate);

    // 3. Ambil jumlah booking aktif yang sudah masuk
    const bookingsQuery = supabase
      .from("bookings")
      .select("service_date, num_units, status")
      .gte("service_date", startDate)
      .lte("service_date", endDate)
      .not("status", "in", '("cancelled","rejected","cancelled_by_admin")');

    const [blackoutsRes, quotasRes, bookingsRes] = await Promise.all([
      blackoutQuery,
      quotaQuery,
      bookingsQuery,
    ]);

    const blackoutMap = new Map<string, { id: string; reason: string }>();
    (blackoutsRes.data || []).forEach((b) => {
      blackoutMap.set(b.date, { id: b.id, reason: b.reason || "" });
    });

    const quotaMap = new Map<string, { id: string; maxUnits: number; bookedUnits: number }>();
    (quotasRes.data || []).forEach((q) => {
      quotaMap.set(q.date, { id: q.id, maxUnits: q.max_units, bookedUnits: q.booked_units });
    });

    const activeBookingsCount = new Map<string, number>();
    (bookingsRes.data || []).forEach((b) => {
      const current = activeBookingsCount.get(b.service_date) || 0;
      activeBookingsCount.set(b.service_date, current + (b.num_units || 1));
    });

    // Buat daftar tanggal dari startDate ke endDate
    const result: DateScheduleItem[] = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);

    while (curr <= end) {
      const dateStr = curr.toISOString().slice(0, 10);
      const isBlackout = blackoutMap.has(dateStr);
      const quota = quotaMap.get(dateStr);
      const booked = activeBookingsCount.get(dateStr) || quota?.bookedUnits || 0;
      const max = quota?.maxUnits || 10; // Default 10 armada Trooper per hari jika tidak diset

      result.push({
        date: dateStr,
        isAvailable: !isBlackout && booked < max,
        reason: isBlackout
          ? blackoutMap.get(dateStr)?.reason || "Jadwal ditutup oleh pengelola"
          : booked >= max
          ? "Kuota armada penuh (10/10 Unit)"
          : undefined,
        bookedUnits: booked,
        maxUnits: max,
        blackoutId: blackoutMap.get(dateStr)?.id,
        quotaId: quota?.id,
      });

      curr.setDate(curr.getDate() + 1);
    }

    return result;
  } catch (err) {
    console.error("[getScheduleRange] Error fetching schedule:", err);
    return generateDefaultSchedule(startDate, endDate);
  }
}

/**
 * Fallback generator jika database belum terhubung
 */
function generateDefaultSchedule(startDate: string, endDate: string): DateScheduleItem[] {
  const result: DateScheduleItem[] = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);
  while (curr <= end) {
    result.push({
      date: curr.toISOString().slice(0, 10),
      isAvailable: true,
      bookedUnits: 0,
      maxUnits: 10,
    });
    curr.setDate(curr.getDate() + 1);
  }
  return result;
}

/**
 * Toggle ketersediaan tanggal (Buka / Tutup Jadwal).
 * Dijalankan oleh Admin atau Owner.
 */
export async function setDateAvailability(params: {
  date: string;
  isAvailable: boolean;
  reason?: string;
  maxUnits?: number;
}): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  if (params.isAvailable) {
    // Buka jadwal: Hapus dari blackout_dates
    const { error: delError } = await supabase
      .from("blackout_dates")
      .delete()
      .eq("date", params.date)
      .is("product_id", null);

    if (delError) {
      throw new Error(`Gagal membuka jadwal: ${delError.message}`);
    }

    // Jika maxUnits ditentukan, perbarui quota
    if (typeof params.maxUnits === "number" && params.maxUnits > 0) {
      await supabase
        .from("sales_quotas")
        .upsert(
          {
            date: params.date,
            max_units: params.maxUnits,
          },
          { onConflict: "product_id,date" }
        );
    }

    return {
      success: true,
      message: `Jadwal tanggal ${params.date} berhasil dibuka (Tersedia / Ready).`,
    };
  } else {
    // Tutup jadwal: Masukkan ke blackout_dates
    const { error: insError } = await supabase
      .from("blackout_dates")
      .upsert(
        {
          date: params.date,
          product_id: null, // Berlaku untuk semua produk
          reason: params.reason || "Jadwal ditutup oleh Admin / Pemilik",
        },
        { onConflict: "product_id,date" }
      );

    if (insError) {
      throw new Error(`Gagal menutup jadwal: ${insError.message}`);
    }

    return {
      success: true,
      message: `Jadwal tanggal ${params.date} berhasil ditutup (Tidak Tersedia).`,
    };
  }
}

/**
 * Bulk toggle ketersediaan rentang tanggal.
 */
export async function bulkSetDateAvailability(params: {
  dates: string[];
  isAvailable: boolean;
  reason?: string;
}): Promise<{ success: boolean; count: number }> {
  for (const d of params.dates) {
    await setDateAvailability({
      date: d,
      isAvailable: params.isAvailable,
      reason: params.reason,
    });
  }
  return { success: true, count: params.dates.length };
}
