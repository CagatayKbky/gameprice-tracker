import { prisma } from "@/lib/db";
import { fetchSteamWishlist } from "@/lib/api/steam-wishlist";
import { unifiedSearch } from "@/lib/api/unified-search";
import { addToWishlist } from "@/lib/services/wishlist";
import { syncSteamLibrary } from "@/lib/services/steam-library";
import { isSteamApiConfigured } from "@/lib/api/steam-web-api";

export async function syncAllSteamUsers() {
  const users = await prisma.userProfile.findMany({
    where: { steamId: { not: null } },
    select: { sessionId: true, steamId: true },
  });

  let wishlistSynced = 0;
  let librarySynced = 0;
  let errors = 0;

  for (const user of users) {
    if (!user.steamId) continue;

    try {
      const items = await fetchSteamWishlist(user.steamId);
      for (const item of items.slice(0, 30)) {
        const results = await unifiedSearch(item.name);
        const match =
          results.find((r) => r.title.toLowerCase() === item.name.toLowerCase()) || results[0];
        if (!match) continue;
        const gameId = item.appId ? `steam-${item.appId}` : match.gameId;
        await addToWishlist(user.sessionId, gameId, match.title, match.imageUrl);
      }
      wishlistSynced++;
    } catch {
      errors++;
    }

    if (isSteamApiConfigured()) {
      try {
        await syncSteamLibrary(user.sessionId);
        librarySynced++;
      } catch {
        errors++;
      }
    }
  }

  return { users: users.length, wishlistSynced, librarySynced, errors };
}
