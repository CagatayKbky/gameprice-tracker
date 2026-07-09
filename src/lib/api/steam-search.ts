import { SearchResult } from "@/types";

interface SteamSearchItem {
  id: number;
  name: string;
  tiny_image: string;
  price?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
  };
}

interface SteamSearchResponse {
  total: number;
  items: SteamSearchItem[];
}

export async function searchSteamStore(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=turkish&cc=TR`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return [];

    const data: SteamSearchResponse = await res.json();
    if (!data.items?.length) return [];

    return data.items
      .filter((item) => item.id && item.name)
      .slice(0, 50)
      .map((item) => {
        const priceTry = item.price ? item.price.final / 100 : undefined;
        const priceUsd = priceTry ? Math.round((priceTry / 34.5) * 100) / 100 : undefined;
        const discount = item.price?.discount_percent || 0;

        return {
          gameId: `steam-${item.id}`,
          title: item.name,
          imageUrl: item.tiny_image,
          steamAppId: String(item.id),
          cheapestPrice: priceUsd,
          cheapestPlatform: "Steam",
          maxDiscount: discount,
          source: "steam" as const,
          platforms: ["steam", "pc"],
        };
      });
  } catch {
    return [];
  }
}

export async function getSteamSearchItem(
  appId: string
): Promise<SteamSearchItem | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=tr&l=turkish`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const data = json[appId]?.data;
    if (!data) return null;
    return {
      id: parseInt(appId),
      name: data.name,
      tiny_image: data.header_image,
      price: data.price_overview
        ? {
            currency: data.price_overview.currency,
            initial: data.price_overview.initial,
            final: data.price_overview.final,
            discount_percent: data.price_overview.discount_percent,
          }
        : data.is_free
          ? { currency: "TRY", initial: 0, final: 0, discount_percent: 0 }
          : undefined,
    };
  } catch {
    return null;
  }
}
