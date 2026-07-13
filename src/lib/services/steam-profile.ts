import { prisma } from "@/lib/db";
import { getSteamLibraryImage } from "@/lib/game-images";
import { fetchSteamCommunityProfile } from "@/lib/api/steam-profile";
import { fetchSteamWishlist } from "@/lib/api/steam-wishlist";

export async function refreshSteamProfileForSession(sessionId: string) {
  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile?.steamId) return null;

  const steam = await fetchSteamCommunityProfile(profile.steamId);
  if (!steam) {
    return {
      steamId: profile.steamId,
      steamPersona: profile.steamPersona,
      steamAvatar: profile.steamAvatar,
      profileUrl: `https://steamcommunity.com/profiles/${profile.steamId}`,
      memberSince: null,
      location: null,
      onlineState: null,
    };
  }

  await prisma.userProfile.update({
    where: { sessionId },
    data: {
      steamPersona: steam.persona,
      steamAvatar: steam.avatarFull,
      name: profile.name || steam.persona,
      updatedAt: new Date(),
    },
  });

  return {
    steamId: steam.steamId,
    steamPersona: steam.persona,
    steamAvatar: steam.avatarFull,
    profileUrl: steam.profileUrl,
    memberSince: steam.memberSince,
    location: steam.location,
    onlineState: steam.onlineState,
  };
}

export async function getSteamWishlistPreview(steamId: string, limit = 6) {
  try {
    const items = await fetchSteamWishlist(steamId);
    return {
      count: items.length,
      items: items.slice(0, limit).map((item) => ({
        name: item.name,
        appId: item.appId,
        gameId: item.appId ? `steam-${item.appId}` : undefined,
        imageUrl: item.appId ? getSteamLibraryImage(item.appId) : undefined,
      })),
    };
  } catch {
    return { count: 0, items: [] };
  }
}
