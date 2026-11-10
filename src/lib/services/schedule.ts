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
    let quotaQuery = supabase
      .from("sales_quotas")
      .select("id, product_id, date, max_units, booked_units")
      .gte("date", startDate)
      .lte("date", endDate);

    if (productId) {
      quotaQuery = quotaQuery.or(`product_id.is.null,product_id.eq.${productId}`);
    }

    // 3. Ambil jumlah booking aktif yang sudah masuk
    let bookingsQuery = supabase
      .from("bookings")
      .select("service_date, num_units, status, product_id")
      .gte("service_date", startDate)
      .lte("service_date", endDate)
      .not("status", "in", '("cancelled","rejected","cancelled_by_admin")');

    if (productId) {
      bookingsQuery = bookingsQuery.eq("product_id", productId);
    }

    const [blackoutsRes, quotasRes, bookingsRes] = await Promise.all([
      blackoutQuery,
      quotaQuery,
      bookingsQuery,
    ]);

    const blackoutMap = new Map<string, { id: string; reason: string }>();
    (blackoutsRes.data || []).forEach((b) => {
      // Prioritaskan spesifik produk jika ada
      if (b.product_id === productId || !blackoutMap.has(b.date)) {
        blackoutMap.set(b.date, { id: b.id, reason: b.reason || "" });
      }
    });

    const quotaMap = new Map<string, { id: string; maxUnits: number; bookedUnits: number }>();
    (quotasRes.data || []).forEach((q) => {
      if (q.product_id === productId || !quotaMap.has(q.date)) {
        quotaMap.set(q.date, { id: q.id, maxUnits: q.max_units, bookedUnits: q.booked_units });
      }
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
 * Dijalankan oleh Admin atau Owner. Mendukung per-katalog maupun global.
 */
export async function setDateAvailability(params: {
  date: string;
  isAvailable: boolean;
  reason?: string;
  maxUnits?: number;
  productId?: string;
}): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  if (params.isAvailable) {
    // Buka jadwal: Hapus dari blackout_dates
    let delQuery = supabase
      .from("blackout_dates")
      .delete()
      .eq("date", params.date);

    if (params.productId) {
      delQuery = delQuery.eq("product_id", params.productId);
    } else {
      delQuery = delQuery.is("product_id", null);
    }

    const { error: delError } = await delQuery;
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
            product_id: params.productId || null,
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
          product_id: params.productId || null,
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
 * Memperbarui pengaturan jam keberangkatan katalog produk
 */
export async function updateProductDepartureSettings(
  productId: string,
  defaultStartTime: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ default_start_time: defaultStartTime })
    .eq("id", productId);

  if (error) {
    throw new Error(`Gagal menyimpan jam keberangkatan: ${error.message}`);
  }

  return {
    success: true,
    message: `Jam keberangkatan katalog berhasil diperbarui ke: ${defaultStartTime} WIB`,
  };
}

/**
 * Bulk toggle ketersediaan rentang tanggal (Buka / Tutup Massal Cepat).
 * Dijalankan secara batch satu query efisien.
 */
export async function bulkSetDateAvailability(params: {
  dates: string[];
  isAvailable: boolean;
  reason?: string;
  maxUnits?: number;
  productId?: string;
}): Promise<{ success: boolean; count: number }> {
  if (!params.dates || params.dates.length === 0) {
    return { success: true, count: 0 };
  }

  const supabase = await createClient();

  if (params.isAvailable) {
    // Buka jadwal massal: Hapus dari blackout_dates sekaligus
    let delQuery = supabase
      .from("blackout_dates")
      .delete()
      .in("date", params.dates);

    if (params.productId) {
      delQuery = delQuery.eq("product_id", params.productId);
    } else {
      delQuery = delQuery.is("product_id", null);
    }

    const { error: delError } = await delQuery;
    if (delError) {
      console.warn("[bulkSetDateAvailability] Error deleting blackouts:", delError);
    }

    // Jika maxUnits ditentukan, perbarui quota sekaligus
    if (typeof params.maxUnits === "number" && params.maxUnits > 0) {
      const quotaRows = params.dates.map((d) => ({
        date: d,
        product_id: params.productId || null,
        max_units: params.maxUnits,
      }));
      await supabase
        .from("sales_quotas")
        .upsert(quotaRows, { onConflict: "product_id,date" });
    }
  } else {
    // Tutup jadwal massal: Upsert ke blackout_dates sekaligus
    const blackoutRows = params.dates.map((d) => ({
      date: d,
      product_id: params.productId || null,
      reason: params.reason || "Jadwal ditutup oleh pengelola",
    }));

    const { error: insError } = await supabase
      .from("blackout_dates")
      .upsert(blackoutRows, { onConflict: "product_id,date" });

    if (insError) {
      console.warn("[bulkSetDateAvailability] Error upserting blackouts:", insError);
      // Fallback satu per satu jika upsert constraint gagal
      for (const d of params.dates) {
        await supabase
          .from("blackout_dates")
          .insert({
            date: d,
            product_id: params.productId || null,
            reason: params.reason || "Jadwal ditutup oleh pengelola",
          });
      }
    }
  }

  return { success: true, count: params.dates.length };
}
