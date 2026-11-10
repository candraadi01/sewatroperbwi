import { z } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/helpers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { idSchema } from "@/lib/validations/requests";
import {
  assertSameOrigin,
  readJson,
  errorResponse,
  RequestError,
} from "@/lib/security/http";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user?.roles.includes("admin") && !user?.roles.includes("owner"))
      throw new RequestError("Akses admin atau pemilik diperlukan.", 403);

    const p = z
      .object({
        id: idSchema,
        status: z
          .enum([
            "confirmed",
            "in_progress",
            "completed",
            "cancelled_by_admin",
          ])
          .optional(),
        reason: z.string().trim().max(1000).optional().default(""),
        start_time: z.string().trim().max(20).optional(),
      })
      .strict()
      .safeParse(await readJson(request));

    if (!p.success) throw new RequestError("Data perubahan tidak valid.");
    if (!p.data.status && !p.data.start_time) {
      throw new RequestError("Status atau jam keberangkatan harus diisi.");
    }

    const adminDb = await createAdminClient();

    // Jika hanya mengubah jam keberangkatan
    if (!p.data.status && p.data.start_time) {
      const { error: timeErr } = await adminDb
        .from("bookings")
        .update({ start_time: p.data.start_time })
        .eq("id", p.data.id);

      if (timeErr) {
        throw new RequestError("Gagal mengubah jam keberangkatan: " + timeErr.message, 500);
      }

      try {
        await adminDb.from("booking_status_history").insert({
          booking_id: p.data.id,
          old_status: "unchanged",
          new_status: "time_updated",
          changed_by: user.id,
          reason: p.data.reason || `Jam keberangkatan diatur ke ${p.data.start_time} WIB`,
        });
      } catch (histErr) {
        console.warn("[start_time history warning]:", histErr);
      }

      revalidatePath("/admin");
      revalidatePath("/admin/pesanan");
      revalidatePath("/akun/pesanan");
      revalidatePath("/buyer");
      revalidatePath("/buyer/pesanan");
      revalidatePath("/pesanan", "layout");

      return NextResponse.json({
        success: true,
        message: "Jam keberangkatan berhasil diperbarui.",
      });
    }

    let updatedSuccessfully = false;

    // 1. Coba melalui RPC database standar
    try {
      const db = await createClient();
      const { error: rpcError } = await db.rpc("set_booking_status", {
        p_id: p.data.id,
        p_status: p.data.status!,
        p_note: p.data.reason || "",
      });

      if (!rpcError) {
        updatedSuccessfully = true;
        if (p.data.start_time) {
          await adminDb
            .from("bookings")
            .update({ start_time: p.data.start_time })
            .eq("id", p.data.id);
        }
      } else {
        console.warn("[set_booking_status RPC returned error, executing fallback]:", rpcError.message);
      }
    } catch (rpcErr: any) {
      console.warn("[set_booking_status RPC call failed]:", rpcErr?.message);
    }

    // 2. Fallback tangguh via createAdminClient
    if (!updatedSuccessfully) {
      const { data: booking, error: bErr } = await adminDb
        .from("bookings")
        .select("id, status")
        .eq("id", p.data.id)
        .single();

      if (bErr || !booking) {
        throw new RequestError("Pesanan tidak ditemukan.", 404);
      }

      const updateData: Record<string, unknown> = { status: p.data.status! };
      if (p.data.start_time) {
        updateData.start_time = p.data.start_time;
      }

      const { error: updateErr } = await adminDb
        .from("bookings")
        .update(updateData)
        .eq("id", p.data.id);

      if (updateErr) {
        console.error("[set_booking_status fallback update error]:", updateErr);
        throw new RequestError("Gagal memperbarui status: " + updateErr.message, 500);
      }

      try {
        await adminDb.from("booking_status_history").insert({
          booking_id: booking.id,
          old_status: booking.status,
          new_status: p.data.status!,
          changed_by: user.id,
          reason: p.data.reason || "Status diperbarui oleh admin",
        });
      } catch (histErr) {
        console.warn("[set_booking_status history warning]:", histErr);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");
    revalidatePath("/akun/pesanan");
    revalidatePath("/buyer");
    revalidatePath("/buyer/pesanan");
    revalidatePath("/pesanan", "layout");

    return NextResponse.json({ success: true, message: "Status pesanan berhasil diperbarui." });
  } catch (e) {
    return errorResponse(e);
  }
}
