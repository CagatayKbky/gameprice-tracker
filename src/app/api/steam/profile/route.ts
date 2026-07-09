import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { getProfile } from "@/lib/services/profile";
import {
  getSteamWishlistPreview,
  refreshSteamProfileForSession,
} from "@/lib/services/steam-profile";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ connected: false });
  }

  const profile = await getProfile(sessionId);
  if (!profile?.steamId) {
    return NextResponse.json({ connected: false });
  }

  const [steam, wishlist] = await Promise.all([
    refreshSteamProfileForSession(sessionId),
    getSteamWishlistPreview(profile.steamId),
  ]);

  return NextResponse.json({
    connected: true,
    steam: steam || {
      steamId: profile.steamId,
      steamPersona: profile.steamPersona,
      steamAvatar: profile.steamAvatar,
      profileUrl: `https://steamcommunity.com/profiles/${profile.steamId}`,
    },
    wishlist,
  });
}
