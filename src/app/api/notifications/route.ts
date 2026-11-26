import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/helpers";
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
} from "@/lib/services/notifications";
import {
  assertSameOrigin,
  readJson,
  errorResponse,
  RequestError,
} from "@/lib/security/http";

interface NotifCookieState {
  read: string[];
  dismissed: string[];
}

function parseNotifCookie(cookieHeader: string): NotifCookieState {
  try {
    const match = cookieHeader.match(/portal_notif_state=([^;]+)/);
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded);
      return {
        read: Array.isArray(parsed.read) ? parsed.read : [],
        dismissed: Array.isArray(parsed.dismissed) ? parsed.dismissed : [],
      };
    }
  } catch {
    // fallback default
  }
  return { read: [], dismissed: [] };
}

function setNotifCookie(res: NextResponse, state: NotifCookieState) {
  res.cookies.set("portal_notif_state", encodeURIComponent(JSON.stringify(state)), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    sameSite: "lax",
    httpOnly: false,
  });
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0, userId: null });
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const notifState = parseNotifCookie(cookieHeader);

    const data = await getNotificationsForUser(user, {
      readIds: notifState.read,
      dismissedIds: notifState.dismissed,
    });

    return NextResponse.json({ ...data, userId: user.id });
  } catch (err) {
    console.error("[GET /api/notifications error]", err);
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user) {
      throw new RequestError("Autentikasi diperlukan.", 401);
    }

    const body = (await readJson(request)) as { id?: string; all?: boolean; readIds?: string[] };
    const cookieHeader = request.headers.get("cookie") || "";
    const notifState = parseNotifCookie(cookieHeader);

    if (body.all) {
      await markAllNotificationsAsRead(user.id);
      if (Array.isArray(body.readIds)) {
        notifState.read = Array.from(new Set([...notifState.read, ...body.readIds])).slice(-100);
      }
    } else if (body.id) {
      await markNotificationAsRead(user.id, body.id);
      if (!notifState.read.includes(body.id)) {
        notifState.read.push(body.id);
        if (notifState.read.length > 100) {
          notifState.read = notifState.read.slice(-100);
        }
      }
    }

    const response = NextResponse.json({ success: true, readIds: notifState.read });
    setNotifCookie(response, notifState);
    return response;
  } catch (err) {
    console.error("[POST /api/notifications error]", err);
    return errorResponse(err);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user) {
      throw new RequestError("Autentikasi diperlukan.", 401);
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const cookieHeader = request.headers.get("cookie") || "";
    const notifState = parseNotifCookie(cookieHeader);

    if (id) {
      await clearNotifications(user.id, id);
      if (!notifState.dismissed.includes(id)) {
        notifState.dismissed.push(id);
        if (notifState.dismissed.length > 100) {
          notifState.dismissed = notifState.dismissed.slice(-100);
        }
      }
    } else {
      let allIds: string[] = [];
      try {
        const body = (await readJson(request)) as { allIds?: string[] };
        if (Array.isArray(body?.allIds)) {
          allIds = body.allIds;
        }
      } catch {
        // empty body is fine
      }
      await clearNotifications(user.id);
      notifState.dismissed = Array.from(new Set([...notifState.dismissed, ...allIds])).slice(-100);
    }

    const response = NextResponse.json({ success: true, dismissedIds: notifState.dismissed });
    setNotifCookie(response, notifState);
    return response;
  } catch (err) {
    console.error("[DELETE /api/notifications error]", err);
    return errorResponse(err);
  }
}
