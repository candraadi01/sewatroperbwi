import { NextResponse } from "next/server";
import { recordVisit, getVisitorStats } from "@/lib/services/visitor-counter";
import { cookies } from "next/headers";

export async function GET() {
  const stats = getVisitorStats();
  return NextResponse.json({ success: true, data: stats }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("vt_session")?.value;

    if (!sessionId) {
      sessionId = "v_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    }

    const stats = recordVisit(sessionId);
    const response = NextResponse.json({ success: true, data: stats }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });

    // Simpan cookie sesi selama 1 hari
    response.cookies.set("vt_session", sessionId, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, data: getVisitorStats() }, { status: 200 });
  }
}

