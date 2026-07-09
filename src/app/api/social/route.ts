import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { getDiscoverProfiles, getSocialActivityFeed, getSocialGraph, sendFriendRequest } from "@/lib/services/social";

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
  const q = request.nextUrl.searchParams.get("q") || undefined;

  const [discover, social, activity] = await Promise.all([
    getDiscoverProfiles(sessionId, q),
    getSocialGraph(sessionId),
    getSocialActivityFeed(sessionId),
  ]);

  return NextResponse.json({ discover, social, activity }, { headers: response.headers });
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({});
  const sessionId = ensureSession(request, response);
  const body = await request.json();

  if (!body.toSessionId) {
    return NextResponse.json({ error: "toSessionId required" }, { status: 400 });
  }

  try {
    const requestRow = await sendFriendRequest(sessionId, body.toSessionId);
    return NextResponse.json({ ok: true, request: requestRow }, { headers: response.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "request_failed";
    return NextResponse.json({ error: message }, { status: 400, headers: response.headers });
  }
}
