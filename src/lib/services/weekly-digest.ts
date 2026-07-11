import { prisma } from "@/lib/db";
import { resolveGame } from "@/lib/api/unified-search";
import type { DealOfTheDay } from "@/types";

export async function getPersonalizedDigestDeals(
  sessionId: string,
  fallback: DealOfTheDay[],
  limit = 8
): Promise<DealOfTheDay[]> {
  const wishlist = await prisma.wishlistItem.findMany({
    where: { sessionId },
    orderBy: { addedAt: "desc" },
    take: 20,
  });

  if (wishlist.length === 0) return fallback.slice(0, limit);

  const personalized: DealOfTheDay[] = [];

  for (const item of wishlist) {
    try {
      const game = await resolveGame(item.cheapSharkGameId);
      const store = game?.cheapestStore;
      if (!store || store.price <= 0 || store.discount < 10) continue;

      personalized.push({
        gameId: item.cheapSharkGameId,
        title: item.gameTitle,
        salePrice: store.price,
        normalPrice: store.normalPrice,
        discount: store.discount,
        platformName: store.platformName,
        imageUrl: item.imageUrl || game.imageUrl,
        dealUrl: store.dealUrl || `/game/${item.cheapSharkGameId}`,
      });
    } catch {
      /* skip */
    }
  }

  if (personalized.length === 0) return fallback.slice(0, limit);
  return personalized.slice(0, limit);
}
