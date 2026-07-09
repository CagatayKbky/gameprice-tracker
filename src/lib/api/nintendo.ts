import { StorePrice } from "@/types";
import { cached } from "@/lib/cache";
import { normalizeTitle } from "@/lib/catalog/utils";

interface NintendoProduct {
  title: string;
  nsuid?: string;
  fs_id?: string;
  url?: string;
  price_regular?: { raw_value?: string; currency?: string };
  price_discount?: { raw_value?: string };
}

export async function searchNintendoStore(gameTitle: string): Promise<StorePrice[]> {
  try {
    const data = await cached<{ products?: NintendoProduct[] }>(
      `nintendo-search:${gameTitle}`,
      600_000,
      async () => {
        const res = await fetch(
          `https://search.nintendo-europe.com/tr/select?q=${encodeURIComponent(gameTitle)}&fq=type:GAME&rows=8`,
          { next: { revalidate: 600 } }
        );
        if (!res.ok) return { products: [] };
        const json = await res.json();
        return { products: json.response?.docs ?? [] };
      }
    );

    const norm = normalizeTitle(gameTitle);
    const products = (data.products ?? [])
      .filter((p) => {
        const t = normalizeTitle(p.title);
        return t.includes(norm) || norm.includes(t);
      })
      .slice(0, 3);

    return products
      .map((p) => {
        const normalPrice = parseFloat(p.price_regular?.raw_value ?? "0");
        const price = parseFloat(p.price_discount?.raw_value ?? p.price_regular?.raw_value ?? "0");
        if (!price && !normalPrice) return null;
        const discount =
          normalPrice > 0 ? Math.round(((normalPrice - price) / normalPrice) * 100) : 0;
        const nsuid = p.nsuid ?? p.fs_id;
        return {
          platformId: "switch",
          platformName: "Nintendo Switch",
          price: price || normalPrice,
          normalPrice: normalPrice || price,
          discount: Math.max(0, discount),
          savings: Math.max(0, normalPrice - price),
          dealUrl:
            p.url ??
            (nsuid
              ? `https://www.nintendo.com.tr/Hardware/Nintendo-Switch-2/Nintendo-Switch-2-713978.html`
              : `https://www.nintendo.com.tr/Search/?text=${encodeURIComponent(gameTitle)}`),
          isOnSale: discount > 0,
          lastUpdated: new Date().toISOString(),
        } satisfies StorePrice;
      })
      .filter(Boolean) as StorePrice[];
  } catch {
    return [];
  }
}
