import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { fetchSteamWishlist } from "@/lib/api/steam-wishlist";
import { unifiedSearch } from "@/lib/api/unified-search";
import { addToWishlist } from "@/lib/services/wishlist";
import { getProfile } from "@/lib/services/profile";
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

export async function POST(request: NextRequest) {
  const response = NextResponse.json({});
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = ensureSession(request, response);

    let profileInput = body.profile?.trim();
    if (!profileInput) {
      const userProfile = await getProfile(sessionId);
      profileInput = userProfile?.steamId || "";
    }
    if (!profileInput) {
      return NextResponse.json(
        { error: "Steam hesabı bağlı değil veya profil ID gerekli" },
        { status: 400, headers: response.headers }
      );
    }

    const steamItems = await fetchSteamWishlist(profileInput);

    if (!steamItems.length) {
      return NextResponse.json({ error: "İstek listesi boş veya bulunamadı" }, { status: 404 });
    }

    let imported = 0;
    const failed: string[] = [];

    for (const item of steamItems.slice(0, 50)) {
      const results = await unifiedSearch(item.name);
      const match =
        results.find((r) => r.title.toLowerCase() === item.name.toLowerCase()) ||
        results[0];

      if (!match) {
        failed.push(item.name);
        continue;
      }

      const gameId = item.appId ? `steam-${item.appId}` : match.gameId;
      await addToWishlist(sessionId, gameId, match.title, match.imageUrl);
      imported += 1;
    }

    return NextResponse.json(
      { imported, total: steamItems.length, failed: failed.slice(0, 10) },
      { headers: response.headers }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
