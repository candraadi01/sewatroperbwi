import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import {
  verifyMidtransSignature,
  midtransConfigured,
  getMidtransStatus,
} from "@/lib/midtrans/snap";
import { createAdminClient } from "@/lib/supabase/server";
import { notificationSchema } from "@/lib/validations/requests";
import { readJson, errorResponse, RequestError } from "@/lib/security/http";
export async function POST(request: Request) {
  try {
    if (!midtransConfigured())
      throw new RequestError("Gateway belum dikonfigurasi.", 503);
    const parsed = notificationSchema.safeParse(await readJson(request, 16000));
    if (!parsed.success) throw new RequestError("Notifikasi tidak valid.", 400);
    const n = parsed.data;
    if (
      !verifyMidtransSignature(
        n.order_id,
        n.status_code,
        n.gross_amount,
        n.signature_key,
      )
    )
      throw new RequestError("Signature tidak valid.", 403);
    if (
      process.env.MIDTRANS_MERCHANT_ID &&
      n.merchant_id !== process.env.MIDTRANS_MERCHANT_ID
    )
      throw new RequestError("Merchant tidak sesuai.", 403);
    const safe = await getMidtransStatus(n.order_id);
    if (Number(safe.gross_amount) !== Number(n.gross_amount))
      throw new RequestError("Nominal gateway tidak sesuai.", 403);
    if (
      process.env.MIDTRANS_MERCHANT_ID &&
      safe.merchant_id !== process.env.MIDTRANS_MERCHANT_ID
    )
      throw new RequestError("Merchant gateway tidak sesuai.", 403);
    const eventId = createHash("sha256")
      .update(JSON.stringify(safe))
      .digest("hex");
    const db = await createAdminClient();
    const { data, error } = await db.rpc("apply_midtrans_event", {
      p: { ...safe, event_id: eventId },
    });
    if (error) {
      console.error("[midtrans] durable event failed", error.code);
      throw new RequestError("Notifikasi belum dapat dicatat.", 503);
    }
    return NextResponse.json({ status: "ok", result: data });
  } catch (e) {
    return errorResponse(e);
  }
}
