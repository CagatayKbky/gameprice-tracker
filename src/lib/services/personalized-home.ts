import { prisma } from "@/lib/db";
import { resolveGame } from "@/lib/api/unified-search";
import { resolveGameImage } from "@/lib/game-images";
import { getOwnedAppIds } from "@/lib/services/steam-library";
import { calculateWorthItScore } from "@/lib/worth-it-score";
import { getSocialGraph } from "@/lib/services/social";
import { mapWithConcurrency } from "@/lib/cache";

export interface PersonalizedDeal {
  gameId: string;
  title: string;
  imageUrl?: string | null;
  price: number;
  discount: number;
  platform: string;
  worthItScore: number;
  isHistoricalLow: boolean;
}

export async function getPersonalizedHomeData(sessionId: string | null) {
  if (!sessionId) {
    return { connected: false as const };
  }

  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile) {
    return { connected: false as const };
  }

  const [wishlist, ownedIds, libraryCount] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { sessionId },
      orderBy: { addedAt: "desc" },
      take: 20,
    }),
    getOwnedAppIds(sessionId),
    prisma.steamOwnedGame.count({ where: { sessionId } }),
  ]);

  const wishlistDeals: PersonalizedDeal[] = [];
  let totalSavings = 0;

  const wishlistSlice = wishlist.slice(0, 12);
  const wishlistResults = await mapWithConcurrency(wishlistSlice, 4, async (item) => {
    try {
      const game = await resolveGame(item.cheapSharkGameId);
      const store = game?.cheapestStore;
      if (!store || store.discount < 10) return null;

      const appId = item.cheapSharkGameId.replace("steam-", "");
      if (profile.hideOwnedGames && ownedIds.has(appId)) return null;

      const savings = Math.max(0, store.normalPrice - store.price);
      return {
        savings,
        deal: {
          gameId: item.cheapSharkGameId,
          title: item.gameTitle,
          imageUrl: resolveGameImage({
            imageUrl: item.imageUrl ?? game?.imageUrl,
            steamAppId: item.cheapSharkGameId.startsWith("steam-")
              ? item.cheapSharkGameId.replace("steam-", "")
              : game?.steamAppId,
          }),
          price: store.price,
          discount: store.discount,
          platform: store.platformName,
          worthItScore: calculateWorthItScore({
            currentPrice: store.price,
            historicalLow: game?.historicalLow,
            discount: store.discount,
            metacritic: game?.metacritic,
          }),
          isHistoricalLow:
            Boolean(game?.historicalLow) && store.price <= (game?.historicalLow ?? 0) * 1.05,
        } satisfies PersonalizedDeal,
      };
    } catch {
      return null;
    }
  });

  for (const row of wishlistResults) {
    if (!row) continue;
    totalSavings += row.savings;
    wishlistDeals.push(row.deal);
  }

  wishlistDeals.sort((a, b) => b.worthItScore - a.worthItScore);

  const friendDeals: Array<
    PersonalizedDeal & { friendName: string; friendCount: number }
  > = [];
  const graph = await getSocialGraph(sessionId);
  const friendSessions = graph.friends
    .map((item) => item.profile?.sessionId)
    .filter((id): id is string => Boolean(id));

  if (friendSessions.length > 0) {
    const myWishlistIds = new Set(wishlist.map((item) => item.cheapSharkGameId));
    const friendWishlist = await prisma.wishlistItem.findMany({
      where: { sessionId: { in: friendSessions } },
    });
    const grouped = new Map<string, { title: string; imageUrl?: string | null; friends: Set<string>; onMyList: boolean }>();
    for (const item of friendWishlist) {
      const existing = grouped.get(item.cheapSharkGameId);
      if (existing) {
        existing.friends.add(item.sessionId);
      } else {
        grouped.set(item.cheapSharkGameId, {
          title: item.gameTitle,
          imageUrl: item.imageUrl,
          friends: new Set([item.sessionId]),
          onMyList: myWishlistIds.has(item.cheapSharkGameId),
        });
      }
    }

    const entries = [...grouped.entries()].sort((a, b) => {
      if (a[1].onMyList !== b[1].onMyList) return a[1].onMyList ? -1 : 1;
      return b[1].friends.size - a[1].friends.size;
    });

    const topEntries = entries.slice(0, 12);
    const friendResults = await mapWithConcurrency(topEntries, 4, async ([gameId, meta]) => {
      try {
        const game = await resolveGame(gameId);
        const store = game?.cheapestStore;
        if (!store || store.discount < 10) return null;
        return {
          gameId,
          title: meta.title,
          imageUrl: meta.imageUrl,
          price: store.price,
          discount: store.discount,
          platform: store.platformName,
          worthItScore: calculateWorthItScore({
            currentPrice: store.price,
            historicalLow: game?.historicalLow,
            discount: store.discount,
            metacritic: game?.metacritic,
          }),
          isHistoricalLow:
            Boolean(game?.historicalLow) && store.price <= (game?.historicalLow ?? 0) * 1.05,
          friendName:
            graph.friends.find((f) => meta.friends.has(f.profile?.sessionId || ""))?.profile
              ?.steamPersona || "Friend",
          friendCount: meta.friends.size,
        };
      } catch {
        return null;
      }
    });

    for (const row of friendResults) {
      if (row) friendDeals.push(row);
    }
  }

  friendDeals.sort((a, b) => b.friendCount - a.friendCount || b.worthItScore - a.worthItScore);

  return {
    connected: true as const,
    steamId: profile.steamId,
    steamPersona: profile.steamPersona,
    onboardingDone: profile.onboardingDone,
    hideOwnedGames: profile.hideOwnedGames,
    libraryCount,
    wishlistCount: wishlist.length,
    wishlistOnSale: wishlistDeals.length,
    totalSavings: Math.round(totalSavings * 100) / 100,
    deals: wishlistDeals.slice(0, 6),
    friendDeals: friendDeals.slice(0, 6),
    ownedAppIds: Array.from(ownedIds),
  };
}

export async function getWishlistSavings(sessionId: string) {
  const items = await prisma.wishlistItem.findMany({ where: { sessionId } });
  let onSale = 0;
  let totalSavings = 0;

  for (const item of items) {
    try {
      const game = await resolveGame(item.cheapSharkGameId);
      const store = game?.cheapestStore;
      if (!store || store.discount < 5) continue;
      onSale++;
      totalSavings += Math.max(0, store.normalPrice - store.price);
    } catch {
      /* skip */
    }
  }

  return {
    total: items.length,
    onSale,
    savings: Math.round(totalSavings * 100) / 100,
  };
}
