import { getHomeDealsBundle } from "@/lib/api/deals";
import {
  getCatalogCount,
  getFeaturedCatalogGames,
  getCatalogLetters,
} from "@/lib/services/catalog-search";
import { PLATFORMS } from "@/lib/platforms";

export async function getHomePageData() {
  const [catalogCount, featured, homeDeals, letters] = await Promise.all([
    getCatalogCount(),
    getFeaturedCatalogGames(16),
    getHomeDealsBundle().catch(() => ({
      deals: [],
      popular: [],
      budgetDeals: [],
      freeGames: [],
    })),
    getCatalogLetters(),
  ]);

  const { deals, popular, budgetDeals, freeGames } = homeDeals;

  const platformCount = PLATFORMS.filter((p) => p.enabled).length;
  const dealCount = deals.length + popular.length + freeGames.length;

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
  };
}
