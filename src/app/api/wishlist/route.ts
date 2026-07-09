import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/lib/services/wishlist";

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

  const items = await getWishlist(sessionId);
  return NextResponse.json(items, {
    headers: response.headers,
  });
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({});
  const sessionId = ensureSession(request, response);
  const body = await request.json();

  const { cheapSharkGameId, gameTitle, imageUrl } = body;
  if (!cheapSharkGameId || !gameTitle) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const item = await addToWishlist(sessionId, cheapSharkGameId, gameTitle, imageUrl);
    return NextResponse.json(item, { headers: response.headers });
  } catch (error) {
    if (error instanceof Error && error.message === "wishlist_limit") {
      const limit = (error as Error & { limit?: number }).limit ?? 5;
      return NextResponse.json(
        { error: "wishlist_limit", limit, upgradeUrl: "/pricing" },
        { status: 403, headers: response.headers }
      );
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const gameId = searchParams.get("gameId");
  if (!gameId) {
    return NextResponse.json({ error: "gameId required" }, { status: 400 });
  }

  await removeFromWishlist(sessionId, gameId);
  return NextResponse.json({ success: true });
}
