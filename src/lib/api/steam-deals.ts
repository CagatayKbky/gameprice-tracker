import { DealOfTheDay } from "@/types";
import { cached } from "@/lib/cache";
import { getSteamStoreUrl } from "@/lib/api/steam";
import { getExchangeRates } from "@/lib/currency";

const STEAM_CC = "TR";
const STEAM_LANG = "turkish";
const SEARCH_CURRENCY = "TRY";

interface SteamFeaturedItem {
  id: number;
  name: string;
  discounted?: boolean;
  discount_percent?: number;
  original_price?: number;
  final_price?: number;
  currency?: string;
  discount_expiration?: number;
  header_image?: string;
  large_capsule_image?: string;
  small_capsule_image?: string;
}

interface ParsedSteamRow {
  appId: string;
  title: string;
  discount: number;
  finalCents: number;
  imageUrl?: string;
}

async function centsToUsd(cents: number, currency?: string): Promise<number> {
  const amount = cents / 100;
  if (currency === "TRY") {
    const rates = await getExchangeRates();
    const tryRate = rates.TRY || 34.5;
    return Math.round((amount / tryRate) * 100) / 100;
  }
  return amount;
}

async function toDeal(
  appId: string,
  title: string,
  discount: number,
  finalCents: number,
  originalCents: number,
  imageUrl?: string,
  currency = "USD"
): Promise<DealOfTheDay> {
  const salePrice = await centsToUsd(finalCents, currency);
  const normalPrice =
    originalCents > 0
      ? await centsToUsd(originalCents, currency)
      : discount > 0
        ? Math.round((salePrice / (1 - discount / 100)) * 100) / 100
        : salePrice;

  return {
    title,
    gameId: `steam-${appId}`,
    steamAppId: appId,
    imageUrl,
    normalPrice,
    salePrice,
    discount,
    platformName: "Steam",
    dealUrl: getSteamStoreUrl(appId),
  };
}

async function mapFeaturedItem(item: SteamFeaturedItem): Promise<DealOfTheDay | null> {
  if (!item.id || !item.name || !item.discounted) return null;
  const discount = item.discount_percent ?? 0;
  const finalCents = item.final_price ?? 0;
  if (!finalCents && discount === 0) return null;

  return toDeal(
    String(item.id),
    item.name,
    discount,
    finalCents,
    item.original_price ?? 0,
    item.header_image || item.large_capsule_image || item.small_capsule_image,
    item.currency
  );
}

function parseSteamSearchHtml(html: string): ParsedSteamRow[] {
  const rows = html.split(/class="search_result_row/);
  const results: ParsedSteamRow[] = [];
  const seen = new Set<string>();

  for (const chunk of rows.slice(1)) {
    const appId = chunk.match(/data-ds-appid="(\d+)"/)?.[1];
    const title = chunk.match(/<span class="title">([^<]+)/)?.[1]?.trim();
    const discount = parseInt(chunk.match(/data-discount="(\d+)"/)?.[1] || "0", 10);
    const finalCents = parseInt(chunk.match(/data-price-final="(\d+)"/)?.[1] || "0", 10);
    const imageUrl = chunk.match(/src="(https:[^"]+store_item_assets[^"]+)"/)?.[1];

    if (!appId || !title || seen.has(appId)) continue;
    seen.add(appId);
    results.push({ appId, title, discount, finalCents, imageUrl });
  }

  return results;
}

async function fetchFeaturedCategories(): Promise<DealOfTheDay[]> {
  const res = await fetch(
    `https://store.steampowered.com/api/featuredcategories/?cc=${STEAM_CC}&l=${STEAM_LANG}`,
    { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return [];

  const data = (await res.json()) as Record<string, { items?: SteamFeaturedItem[] }>;
  const deals: DealOfTheDay[] = [];
  const seen = new Set<string>();

  for (const key of ["specials", "top_sellers", "new_releases", "coming_soon"]) {
    for (const item of data[key]?.items ?? []) {
      const deal = await mapFeaturedItem(item);
      if (!deal || seen.has(deal.gameId)) continue;
      seen.add(deal.gameId);
      deals.push(deal);
    }
  }

  return deals.sort((a, b) => b.discount - a.discount);
}

async function fetchSteamSearchPage(page: number): Promise<DealOfTheDay[]> {
  const res = await fetch(
    `https://store.steampowered.com/search/?term=&supportedlang=${STEAM_LANG}&specials=1&page=${page}&cc=${STEAM_CC}`,
    {
      headers: { "User-Agent": "GamePrice/1.0" },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!res.ok) return [];

  const html = await res.text();
  const rows = parseSteamSearchHtml(html);
  return Promise.all(
    rows.map((row) =>
      toDeal(row.appId, row.title, row.discount, row.finalCents, 0, row.imageUrl, SEARCH_CURRENCY)
    )
  );
}

export async function getSteamStoreDeals(limit = 60): Promise<DealOfTheDay[]> {
  return cached(`steam-deals:${limit}`, 10 * 60 * 1000, async () => {
    const [featured, page1, page2] = await Promise.all([
      fetchFeaturedCategories(),
      fetchSteamSearchPage(1),
      fetchSteamSearchPage(2),
    ]);

    const merged = new Map<string, DealOfTheDay>();
    for (const deal of [...featured, ...page1, ...page2]) {
      if (!merged.has(deal.gameId)) merged.set(deal.gameId, deal);
    }

    return Array.from(merged.values())
      .filter((d) => d.discount > 0 || d.salePrice === 0)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, limit);
  });
}

export async function getSteamFreeGames(): Promise<DealOfTheDay[]> {
  const res = await fetch(
    `https://store.steampowered.com/search/?term=&supportedlang=${STEAM_LANG}&maxprice=free&page=1&cc=${STEAM_CC}`,
    { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return [];

  const html = await res.text();
  const rows = parseSteamSearchHtml(html).filter((r) => r.finalCents === 0);
  return Promise.all(
    rows.map((row) => toDeal(row.appId, row.title, 100, 0, 0, row.imageUrl, SEARCH_CURRENCY))
  );
}

export async function getSteamMegaDeals(): Promise<DealOfTheDay[]> {
  const deals = await getSteamStoreDeals(80);
  return deals.filter((d) => d.discount >= 75);
}

export async function getSteamUnderPriceDeals(maxUsd: number): Promise<DealOfTheDay[]> {
  const deals = await getSteamStoreDeals(80);
  return deals.filter((d) => d.salePrice <= maxUsd && d.discount >= 30);
}

/** Only return a sale end when many specials share the same expiry (major sale, not per-game). */
function detectMajorSaleEnd(items: SteamFeaturedItem[]): string | undefined {
  const nowSec = Math.floor(Date.now() / 1000);
  const counts = new Map<number, number>();

  for (const item of items) {
    const exp = item.discount_expiration;
    if (!exp || exp <= nowSec || !item.discounted) continue;
    counts.set(exp, (counts.get(exp) ?? 0) + 1);
  }

  let bestExp = 0;
  let bestCount = 0;
  for (const [exp, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      bestExp = exp;
    }
  }

  // Require several games with the same end time — signals a platform-wide sale.
  if (bestCount >= 5 && bestExp > nowSec) {
    return new Date(bestExp * 1000).toISOString();
  }
  return undefined;
}

export async function getSteamSaleEndIso(): Promise<string | undefined> {
  return cached("steam-sale-end", 30 * 60 * 1000, async () => {
    try {
      const res = await fetch(
        `https://store.steampowered.com/api/featuredcategories/?cc=${STEAM_CC}&l=${STEAM_LANG}`,
        { next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) return undefined;

      const data = (await res.json()) as Record<string, { items?: SteamFeaturedItem[] }>;
      const specials = data.specials?.items ?? [];
      return detectMajorSaleEnd(specials);
    } catch {
      return undefined;
    }
  });
}
