import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ items: [], unread: 0 });
  }

  const [items, unread] = await Promise.all([
    getUserNotifications(sessionId),
    getUnreadNotificationCount(sessionId),
  ]);

  return NextResponse.json({ items, unread });
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === "read-all") {
    await markAllNotificationsRead(sessionId);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "read" && body.id) {
    await markNotificationRead(sessionId, body.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 });
}
