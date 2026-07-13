import { getHomeDealsBundle } from "@/lib/api/deals";
import { getEpicFreeGames } from "@/lib/api/epic-free";
import {
  getCatalogCount,
  getFeaturedCatalogGames,
  getCatalogLetters,
} from "@/lib/services/catalog-search";
import { PLATFORMS } from "@/lib/platforms";

export async function getHomePageData() {
  const [catalogCount, featured, homeDeals, letters, epicFree] = await Promise.all([
    getCatalogCount(),
    getFeaturedCatalogGames(16),
    getHomeDealsBundle().catch(() => ({
      deals: [],
      popular: [],
      budgetDeals: [],
      freeGames: [],
    })),
    getCatalogLetters(),
    getEpicFreeGames().catch(() => []),
  ]);

  const { deals, popular, budgetDeals, freeGames } = homeDeals;

  const platformCount = PLATFORMS.filter((p) => p.enabled).length;
  const dealCount = deals.length + popular.length + freeGames.length;
  const allDeals = [...deals, ...popular, ...freeGames];
  const liveStats = {
    dealCount: allDeals.filter((d) => d.discount > 0).length,
    maxDiscount: allDeals.reduce((m, d) => Math.max(m, d.discount || 0), 0),
    freeCount: freeGames.length,
  };

  return {
    catalogCount,
    platformCount,
    dealCount,
    featured,
    deals,
    popular,
    freeGames,
    budgetDeals,
    letters,
    epicFree,
    liveStats,
  };
}
