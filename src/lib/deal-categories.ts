import { DealOfTheDay } from "@/types";
import {
  getDealsFiltered,
  getFreeGames,
  getMegaDeals,
  getUnderPriceDeals,
  getHistoricalLowDeals,
  searchGamesAdvanced,
} from "@/lib/api/deals";

export interface DealCategory {
  slug: string;
  title: string;
  subtitle: string;
  minDiscount?: number;
}

export const DEAL_CATEGORIES: DealCategory[] = [
  { slug: "under-5", title: "$5 Altı", subtitle: "Bütçe dostu mini fırsatlar" },
  { slug: "under-10", title: "$10 Altı", subtitle: "Uygun fiyatlı indirimler" },
  { slug: "rpg", title: "RPG İndirimleri", subtitle: "Rol yapma oyunlarında fırsatlar" },
  { slug: "action", title: "Aksiyon İndirimleri", subtitle: "Action oyunlarda indirim" },
  { slug: "indie", title: "Indie İndirimleri", subtitle: "Bağımsız yapımlar" },
  { slug: "free", title: "Ücretsiz Oyunlar", subtitle: "Şu an ücretsiz" },
  { slug: "mega", title: "Mega İndirimler", subtitle: "%75 ve üzeri" },
  { slug: "historical-low", title: "Tarihi Dip", subtitle: "En düşük fiyatlara yakın" },
];

export async function getDealsForCategory(slug: string): Promise<DealOfTheDay[]> {
  switch (slug) {
    case "under-5":
      return getUnderPriceDeals(5);
    case "under-10":
      return getUnderPriceDeals(10);
    case "free":
      return getFreeGames();
    case "mega":
      return getMegaDeals();
    case "historical-low":
      return getHistoricalLowDeals();
    case "rpg":
      return searchGamesAdvanced("RPG", { minDiscount: 30, pageSize: 24 }).then(
        (r) =>
          r
            .filter((g) => g.cheapestPrice)
            .map((g) => ({
              title: g.title,
              gameId: g.gameId,
              imageUrl: g.imageUrl,
              normalPrice: g.cheapestPrice! * 1.5,
              salePrice: g.cheapestPrice!,
              discount: g.maxDiscount || 0,
              platformName: g.cheapestPlatform || "Store",
              dealUrl: `/game/${g.gameId}`,
            }))
      );
    case "action":
      return searchGamesAdvanced("action", { minDiscount: 30, pageSize: 24 }).then(
        (r) =>
          r
            .filter((g) => g.cheapestPrice)
            .map((g) => ({
              title: g.title,
              gameId: g.gameId,
              imageUrl: g.imageUrl,
              normalPrice: g.cheapestPrice! * 1.5,
              salePrice: g.cheapestPrice!,
              discount: g.maxDiscount || 0,
              platformName: g.cheapestPlatform || "Store",
              dealUrl: `/game/${g.gameId}`,
            }))
      );
    case "indie":
      return getDealsFiltered({ minDiscount: 40, maxPrice: 20, pageSize: 24 });
    default:
      return getDealsFiltered({ minDiscount: 50, pageSize: 24 });
  }
}

export function getCategoryMeta(slug: string): DealCategory | undefined {
  return DEAL_CATEGORIES.find((c) => c.slug === slug);
}
