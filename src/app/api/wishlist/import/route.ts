import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { unifiedSearch } from "@/lib/api/unified-search";
import { addToWishlist } from "@/lib/services/wishlist";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

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

function parseGameNames(input: string): string[] {
  return input
    .split(/[\n,;]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 1)
    .slice(0, 50);
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({});
  try {
    const body = await request.json();
    const text = body.games?.trim();
    if (!text) {
      return NextResponse.json({ error: "Oyun listesi gerekli" }, { status: 400 });
    }

    const sessionId = ensureSession(request, response);
    const names = parseGameNames(text);

    if (!names.length) {
      return NextResponse.json({ error: "Geçerli oyun adı bulunamadı" }, { status: 400 });
    }

    let imported = 0;
    const failed: string[] = [];

    for (const name of names) {
      const results = await unifiedSearch(name);
      const match =
        results.find((r) => r.title.toLowerCase() === name.toLowerCase()) || results[0];

      if (!match) {
        failed.push(name);
        continue;
      }

      await addToWishlist(sessionId, match.gameId, match.title, match.imageUrl);
      imported += 1;
    }

    return NextResponse.json(
      { imported, total: names.length, failed: failed.slice(0, 10) },
      { headers: response.headers }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
