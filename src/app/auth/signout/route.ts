import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { assertSameOrigin, errorResponse } from "@/lib/security/http";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const db = await createClient();
    await db.auth.signOut();
  } catch (e) {
    return errorResponse(e);
  }
  redirect("/");
}
