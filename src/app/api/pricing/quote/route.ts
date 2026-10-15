import { rateLimit } from "@/lib/security/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { NextResponse } from "next/server";
import { calculateQuote } from "@/lib/pricing/engine";
import {
  assertSameOrigin,
  readJson,
  RequestError,
  errorResponse,
} from "@/lib/security/http";
import { quoteRequestSchema } from "@/lib/validations/requests";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = quoteRequestSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new RequestError(parsed.error.issues[0].message);
    if (isSupabaseConfigured())
      await rateLimit(
        "quote:" +
          (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            "unknown"),
        60,
      );
    let data;
    try {
      data = await calculateQuote(parsed.data);
    } catch (e) {
      throw new RequestError(
        e instanceof Error ? e.message : "Harga belum dapat dihitung.",
      );
    }
    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
