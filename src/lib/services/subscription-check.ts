import { getSubscriptionStatus } from "@/lib/api/console-prices";

export interface SubscriptionCheckResult {
  gameId: string;
  gameTitle: string;
  gamepass: boolean;
  psplus: boolean;
}

export async function checkWishlistSubscriptions(
  items: { cheapSharkGameId: string; gameTitle: string }[]
): Promise<SubscriptionCheckResult[]> {
  const batch = items.slice(0, 20);
  const results = await Promise.all(
    batch.map(async (item) => {
      try {
        const status = await getSubscriptionStatus(item.gameTitle);
        return {
          gameId: item.cheapSharkGameId,
          gameTitle: item.gameTitle,
          gamepass: status.gamepass,
          psplus: status.psplus,
        };
      } catch {
        return {
          gameId: item.cheapSharkGameId,
          gameTitle: item.gameTitle,
          gamepass: false,
          psplus: false,
        };
      }
    })
  );
  return results;
}
