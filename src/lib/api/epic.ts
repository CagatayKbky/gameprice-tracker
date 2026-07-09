import { StorePrice } from "@/types";
import { cached } from "@/lib/cache";

interface EpicSearchItem {
  title: string;
  id: string;
  namespace: string;
  seller?: { name: string };
  price?: {
    totalPrice?: {
      discountPrice?: number;
      originalPrice?: number;
      discount?: number;
      currencyCode?: string;
    };
  };
  url?: string;
}

export async function searchEpicStore(gameTitle: string): Promise<StorePrice[]> {
  try {
    const data = await cached<{ elements?: EpicSearchItem[] }>(
      `epic-search:${gameTitle}`,
      300_000,
      async () => {
        const res = await fetch(
          `https://store-site-backend-static-ipv4.ak.epicgames.com/storefront/api/search/${encodeURIComponent(gameTitle)}?country=TR&locale=tr&allowCountries=TR`,
          { next: { revalidate: 300 } }
        );
        if (!res.ok) return { elements: [] };
        return res.json();
      }
    );

    const items = (data.elements ?? []).slice(0, 3);
    return items
      .map((item) => {
        const tp = item.price?.totalPrice;
        if (!tp?.originalPrice) return null;
        const price = (tp.discountPrice ?? tp.originalPrice) / 100;
        const normalPrice = tp.originalPrice / 100;
        const discount = tp.discount ?? 0;
        const slug = item.url?.replace(/^\/+/, "") ?? `${item.namespace}/${item.id}`;
        return {
          platformId: "epic",
          platformName: "Epic Games",
          price,
          normalPrice,
          discount,
          savings: normalPrice - price,
          dealUrl: `https://store.epicgames.com/tr/p/${slug}`,
          isOnSale: discount > 0,
          lastUpdated: new Date().toISOString(),
        } satisfies StorePrice;
      })
      .filter(Boolean) as StorePrice[];
  } catch {
    return [];
  }
}
