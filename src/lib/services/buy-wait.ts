import { prisma } from "@/lib/db";
import { resolveGame } from "@/lib/api/unified-search";
import { getOwnedAppIds } from "@/lib/services/steam-library";
import { calculateWorthItScore } from "@/lib/worth-it-score";

export type BuyWaitVerdict = "buy" | "wait" | "watch";

export interface BuyWaitItem {
  gameId: string;
  title: string;
  imageUrl?: string | null;
  price: number;
  normalPrice: number;
  discount: number;
  platform: string;
  historicalLow?: number;
  score: number;
  verdict: BuyWaitVerdict;
  reasonKey: string;
  reasonParams?: Record<string, string>;
  isHistoricalLow: boolean;
}

function pickVerdict(params: {
  score: number;
  discount: number;
  price: number;
  historicalLow?: number;
}): { verdict: BuyWaitVerdict; reasonKey: string; reasonParams?: Record<string, string> } {
  const { score, discount, price, historicalLow } = params;

  if (historicalLow && historicalLow > 0) {
    const diffPct = ((price - historicalLow) / historicalLow) * 100;
    if (diffPct <= 5 && discount >= 40) {
      return { verdict: "buy", reasonKey: "buyWait.reason.historicalLow" };
    }
    if (diffPct > 25 && discount < 35) {
      return {
        verdict: "wait",
        reasonKey: "buyWait.reason.aboveLow",
        reasonParams: { pct: String(Math.round(diffPct)) },
      };
    }
  }

  if (score >= 78) {
    return { verdict: "buy", reasonKey: "buyWait.reason.highScore" };
  }
  if (score < 50 && discount < 25) {
    return { verdict: "wait", reasonKey: "buyWait.reason.lowDiscount" };
  }
  if (discount >= 50) {
    return { verdict: "watch", reasonKey: "buyWait.reason.goodDiscount" };
  }
  return { verdict: "watch", reasonKey: "buyWait.reason.monitor" };
}

export async function getBuyWaitRecommendations(sessionId: string, limit = 12) {
  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile) {
    return { items: [] as BuyWaitItem[], summary: { buy: 0, wait: 0, watch: 0 } };
  }

  const [wishlist, ownedIds] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { sessionId },
      orderBy: { addedAt: "desc" },
      take: 24,
    }),
    getOwnedAppIds(sessionId),
  ]);

  const items: BuyWaitItem[] = [];

  for (const item of wishlist) {
    try {
      const game = await resolveGame(item.cheapSharkGameId);
      const store = game?.cheapestStore;
      if (!store || store.price <= 0) continue;

      const appId = item.cheapSharkGameId.replace("steam-", "");
      if (profile.hideOwnedGames && ownedIds.has(appId)) continue;

      const score = calculateWorthItScore({
        currentPrice: store.price,
        historicalLow: game?.historicalLow,
        discount: store.discount,
        metacritic: game?.metacritic,
      });

      const { verdict, reasonKey, reasonParams } = pickVerdict({
        score,
        discount: store.discount,
        price: store.price,
        historicalLow: game?.historicalLow,
      });

      items.push({
        gameId: item.cheapSharkGameId,
        title: item.gameTitle,
        imageUrl: item.imageUrl,
        price: store.price,
        normalPrice: store.normalPrice,
        discount: store.discount,
        platform: store.platformName,
        historicalLow: game?.historicalLow,
        score,
        verdict,
        reasonKey,
        reasonParams,
        isHistoricalLow:
          Boolean(game?.historicalLow) && store.price <= (game?.historicalLow ?? 0) * 1.05,
      });
    } catch {
      /* skip */
    }
  }

  const verdictOrder = { buy: 0, watch: 1, wait: 2 };
  items.sort((a, b) => verdictOrder[a.verdict] - verdictOrder[b.verdict] || b.score - a.score);

  const summary = {
    buy: items.filter((i) => i.verdict === "buy").length,
    wait: items.filter((i) => i.verdict === "wait").length,
    watch: items.filter((i) => i.verdict === "watch").length,
  };

  return { items: items.slice(0, limit), summary };
}
