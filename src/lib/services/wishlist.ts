import { prisma } from "@/lib/db";
import { WishlistItemData } from "@/types";
import { resolveGame } from "@/lib/api/unified-search";
import { resolveGameImage } from "@/lib/game-images";
import { assertWishlistCapacity } from "@/lib/premium/access";

export async function getWishlist(sessionId: string): Promise<WishlistItemData[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { sessionId },
    orderBy: { addedAt: "desc" },
  });

  const enriched = await Promise.all(
    items.map(async (item) => {
      try {
        const game = await resolveGame(item.cheapSharkGameId);
        return {
          id: item.id,
          cheapSharkGameId: item.cheapSharkGameId,
          gameTitle: item.gameTitle,
          imageUrl:
            item.imageUrl ||
            resolveGameImage({
              imageUrl: game?.imageUrl,
              steamAppId: game?.steamAppId,
            }),
          addedAt: item.addedAt.toISOString(),
          currentPrice:
            game?.cheapestStore && game.cheapestStore.price > 0
              ? game.cheapestStore.price
              : undefined,
          cheapestPlatform:
            game?.cheapestStore && game.cheapestStore.price > 0
              ? game.cheapestStore.platformName
              : undefined,
        };
      } catch {
        return {
          id: item.id,
          cheapSharkGameId: item.cheapSharkGameId,
          gameTitle: item.gameTitle,
          imageUrl: item.imageUrl,
          addedAt: item.addedAt.toISOString(),
        };
      }
    })
  );

  return enriched;
}

export async function addToWishlist(
  sessionId: string,
  cheapSharkGameId: string,
  gameTitle: string,
  imageUrl?: string
) {
  const existing = await prisma.wishlistItem.findUnique({
    where: { sessionId_cheapSharkGameId: { sessionId, cheapSharkGameId } },
  });
  if (!existing) {
    const capacity = await assertWishlistCapacity(sessionId);
    if (!capacity.ok) {
      const err = new Error("wishlist_limit") as Error & { code?: string; limit?: number };
      err.code = "wishlist_limit";
      err.limit = capacity.limit;
      throw err;
    }
  }

  return prisma.wishlistItem.upsert({
    where: { sessionId_cheapSharkGameId: { sessionId, cheapSharkGameId } },
    create: { sessionId, cheapSharkGameId, gameTitle, imageUrl },
    update: { gameTitle, imageUrl },
  });
}

export async function removeFromWishlist(sessionId: string, cheapSharkGameId: string) {
  return prisma.wishlistItem.deleteMany({
    where: { sessionId, cheapSharkGameId },
  });
}

export async function isInWishlist(sessionId: string, cheapSharkGameId: string) {
  const item = await prisma.wishlistItem.findUnique({
    where: { sessionId_cheapSharkGameId: { sessionId, cheapSharkGameId } },
  });
  return !!item;
}
