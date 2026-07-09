import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { savePushSubscription, removePushSubscription } from "@/lib/services/push";
import { upsertProfile } from "@/lib/services/profile";
import { assertProFeature } from "@/lib/premium/access";

function ensureSession(request: NextRequest, response: NextResponse): string {
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const sessionId = randomUUID();
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return sessionId;
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const sessionId = ensureSession(request, response);
  const body = await request.json();

  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const proCheck = await assertProFeature(sessionId, "push");
  if (!proCheck.ok) {
    return NextResponse.json(
      { error: "pro_required", feature: "push", upgradeUrl: "/pricing" },
      { status: 403, headers: response.headers }
    );
  }

  await upsertProfile(sessionId, { pushNotifications: true });
  await savePushSubscription(sessionId, { endpoint, keys });

  return NextResponse.json({ ok: true }, { headers: response.headers });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { endpoint } = body;
  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
  }

  await removePushSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
