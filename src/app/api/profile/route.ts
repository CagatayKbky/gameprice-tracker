import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { getProfile, upsertProfile } from "@/lib/services/profile";

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

export async function GET(request: NextRequest) {
  const response = NextResponse.json({});
  const sessionId =
    request.cookies.get(SESSION_COOKIE)?.value ?? ensureSession(request, response);

  const profile = await getProfile(sessionId);
  return NextResponse.json(
    profile || {
      email: null,
      name: null,
      emailNotifications: true,
      weeklyDigest: true,
      pushNotifications: true,
      wishlistDealAlerts: true,
      discordWebhook: null,
      telegramChatId: null,
      steamId: null,
      steamPersona: null,
    },
    { headers: response.headers }
  );
}

export async function PUT(request: NextRequest) {
  const response = NextResponse.json({});
  const sessionId = ensureSession(request, response);
  const body = await request.json();

  const {
    email,
    name,
    emailNotifications,
    weeklyDigest,
    pushNotifications,
    wishlistDealAlerts,
    discordWebhook,
    telegramChatId,
  } = body;
  const profile = await upsertProfile(sessionId, {
    email: email || null,
    name: name || null,
    emailNotifications: emailNotifications !== false,
    weeklyDigest: weeklyDigest !== false,
    pushNotifications: pushNotifications !== false,
    wishlistDealAlerts: wishlistDealAlerts !== false,
    discordWebhook: discordWebhook || null,
    telegramChatId: telegramChatId || null,
  });

  return NextResponse.json(profile, { headers: response.headers });
}
