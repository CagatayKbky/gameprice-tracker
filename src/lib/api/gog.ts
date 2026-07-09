import { StorePrice } from "@/types";
import { cached } from "@/lib/cache";
import { normalizeTitle } from "@/lib/catalog/utils";

interface GogProduct {
  title: string;
  id: number;
  price?: { finalAmount?: string; baseAmount?: string; isDiscounted?: boolean };
  url?: string;
}

export async function searchGogStore(gameTitle: string): Promise<StorePrice[]> {
  try {
    const data = await cached<{ products?: GogProduct[] }>(
      `gog-search:${gameTitle}`,
      300_000,
      async () => {
        const res = await fetch(
          `https://www.gog.com/games/ajax/filtered?mediaType=game&search=${encodeURIComponent(gameTitle)}&countryCode=TR`,
          {
            headers: { Accept: "application/json" },
            next: { revalidate: 300 },
          }
        );
        if (!res.ok) return { products: [] };
        return res.json();
      }
    );

    const norm = normalizeTitle(gameTitle);
    const products = (data.products ?? [])
      .filter((p) => normalizeTitle(p.title).includes(norm) || norm.includes(normalizeTitle(p.title)))
      .slice(0, 3);

    return products
      .map((p) => {
        const price = parseFloat(p.price?.finalAmount ?? "0");
        const normalPrice = parseFloat(p.price?.baseAmount ?? p.price?.finalAmount ?? "0");
        if (!price && !normalPrice) return null;
        const discount =
          normalPrice > 0 ? Math.round(((normalPrice - price) / normalPrice) * 100) : 0;
        return {
          platformId: "gog",
          platformName: "GOG",
          price: price || normalPrice,
          normalPrice: normalPrice || price,
          discount: Math.max(0, discount),
          savings: Math.max(0, normalPrice - price),
          dealUrl: p.url ? `https://www.gog.com${p.url}` : `https://www.gog.com/en/games?search=${encodeURIComponent(gameTitle)}`,
          isOnSale: Boolean(p.price?.isDiscounted),
          lastUpdated: new Date().toISOString(),
        } satisfies StorePrice;
      })
      .filter(Boolean) as StorePrice[];
  } catch {
    return [];
  }
}
