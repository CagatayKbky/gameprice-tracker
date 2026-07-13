import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { getProfile } from "@/lib/services/profile";
import {
  getSteamWishlistPreview,
  refreshSteamProfileForSession,
} from "@/lib/services/steam-profile";
import { withTimeout } from "@/lib/timeout";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ connected: false });
  }

  const profile = await getProfile(sessionId);
  if (!profile?.steamId) {
    return NextResponse.json({ connected: false });
  }

  const refresh = request.nextUrl.searchParams.get("refresh") === "1";
  const includeWishlist = request.nextUrl.searchParams.get("wishlist") !== "0";

  const cachedSteam = {
    steamId: profile.steamId,
    steamPersona: profile.steamPersona,
    steamAvatar: profile.steamAvatar,
    profileUrl: `https://steamcommunity.com/profiles/${profile.steamId}`,
    memberSince: null as string | null,
    location: null as string | null,
    onlineState: null as string | null,
  };

  const steam = await withTimeout(
    refresh ? refreshSteamProfileForSession(sessionId) : Promise.resolve(cachedSteam),
    refresh ? 8_000 : 100,
    cachedSteam
  );

  const wishlist = includeWishlist
    ? await withTimeout(
        getSteamWishlistPreview(profile.steamId),
        8_000,
        { count: 0, items: [] }
      )
    : { count: 0, items: [] };

  return NextResponse.json({
    connected: true,
    steam: steam || cachedSteam,
    wishlist,
  });
}
