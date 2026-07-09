import { StorePrice } from "@/types";

const PS_SEARCH =
  "https://store.playstation.com/store/api/chihiro/00_09_000/tumbler/TR/tr/999";

interface PsProduct {
  name: string;
  id: string;
  default_sku?: {
    display_price: string;
    price: number;
  };
  playable_platform?: string[];
}

function parsePsPrice(displayPrice: string): number {
  if (/free|ücretsiz/i.test(displayPrice)) return 0;
  const match = displayPrice.replace(/\./g, "").match(/[\d,]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(",", "."));
}

function tryToUsd(amountTry: number, tryRate = 34.5): number {
  if (amountTry === 0) return 0;
  return Math.round((amountTry / tryRate) * 100) / 100;
}

export async function getPlayStationPlusStatus(gameTitle: string): Promise<boolean> {
  try {
    const query = gameTitle.split(":")[0].trim().slice(0, 40);
    const res = await fetch(
      `${PS_SEARCH}/${encodeURIComponent(query)}?suggested_size=5&mode=game`,
      {
        next: { revalidate: 3600 },
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) return false;

    const data = await res.json();
    const products: PsProduct[] = data?.links || [];

    return products.some((product) => {
      const nameMatch = product.name?.toLowerCase().includes(query.toLowerCase().slice(0, 8));
      if (!nameMatch) return false;
      const price = product.default_sku?.display_price || "";
      return /ps plus|playstation plus|ücretsiz|free/i.test(price);
    });
  } catch {
    return false;
  }
}

export async function getPlayStationPrices(gameTitle: string): Promise<StorePrice[]> {
  try {
    const query = gameTitle.split(":")[0].trim().slice(0, 40);
    const res = await fetch(
      `${PS_SEARCH}/${encodeURIComponent(query)}?suggested_size=3&mode=game`,
      {
        next: { revalidate: 3600 },
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const products: PsProduct[] = data?.links || [];
    if (!Array.isArray(products) || !products.length) return [];

    const match =
      products.find((p) =>
        p.name?.toLowerCase().includes(query.toLowerCase().slice(0, 10))
      ) || products[0];

    const sku = match.default_sku;
    if (!sku) return [];

    const priceTry = sku.price ? sku.price / 100 : parsePsPrice(sku.display_price);
    const priceUsd = tryToUsd(priceTry);
    const dealUrl = match.id
      ? `https://store.playstation.com/tr-tr/product/${match.id}`
      : `https://store.playstation.com/tr-tr/search/${encodeURIComponent(gameTitle)}`;

    const platforms = match.playable_platform || [];
    const hasPs5 = platforms.some((p) => /PS5/i.test(p));
    const hasPs4 = platforms.some((p) => /PS4/i.test(p));

    const base: Omit<StorePrice, "platformId" | "platformName"> = {
      price: priceUsd,
      normalPrice: priceUsd,
      discount: 0,
      savings: 0,
      dealUrl,
      isOnSale: false,
      lastUpdated: new Date().toISOString(),
    };

    const results: StorePrice[] = [];
    if (hasPs5 || (!hasPs5 && !hasPs4)) {
      results.push({ ...base, platformId: "ps5", platformName: "PlayStation Store (PS5)" });
    }
    if (hasPs4) {
      results.push({ ...base, platformId: "ps4", platformName: "PlayStation Store (PS4)" });
    }
    if (!results.length) {
      results.push({ ...base, platformId: "ps5", platformName: "PlayStation Store (PS5)" });
    }

    return results;
  } catch {
    return [];
  }
}
