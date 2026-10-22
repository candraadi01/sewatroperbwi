import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const db = await createClient();
    await db.auth.signOut();
  } catch (e) {
    console.error("[signout] error signing out:", e);
  }
  return NextResponse.redirect(new URL("/", request.url), 303);
}

export async function GET(request: Request) {
  try {
    const db = await createClient();
    await db.auth.signOut();
  } catch (e) {
    console.error("[signout] error signing out:", e);
  }
  return NextResponse.redirect(new URL("/", request.url), 303);
}
