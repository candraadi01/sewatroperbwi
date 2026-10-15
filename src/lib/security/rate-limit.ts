import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { RequestError } from "./http";
export async function rateLimit(key: string, limit = 20, seconds = 60) {
  const db = await createAdminClient();
  const { data, error } = await db.rpc("consume_rate_limit", {
    p_key: createHash("sha256").update(key).digest("hex"),
    p_limit: limit,
    p_seconds: seconds,
  });
  if (error)
    throw new RequestError(
      "Pembatasan transaksi belum siap. Hubungi pengelola.",
      503,
    );
  if (!data)
    throw new RequestError(
      "Terlalu banyak permintaan. Coba kembali sebentar lagi.",
      429,
    );
}
