import { DealOfTheDay, SearchResult, BundleDeal } from "@/types";
import { getPlatformByCheapSharkId, getPlatformById } from "@/lib/platforms";
import { cacheGet, cacheSet, cached, mapWithConcurrency } from "@/lib/cache";
import {
  getSteamStoreDeals,
  getSteamFreeGames,
  getSteamMegaDeals,
  getSteamUnderPriceDeals,
} from "@/lib/api/steam-deals";
import { getEpicFreeGames } from "@/lib/api/epic-free";

const CHEAPSHARK_BASE = "https://www.cheapshark.com/api/1.0";
let cheapSharkGlobalBlockedUntil = 0;

interface CheapSharkDeal {
  internalName: string;
  title: string;
  metacriticLink: string;
  dealID: string;
  storeID: string;
  gameID: string;
  steamAppID: string | null;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string | null;
  steamRatingPercent: string;
  steamRatingCount: string;
  thumb: string;
}

interface CheapSharkGameLookup {
  info: { title: string; steamAppID: string | null; thumb: string };
  deals: Array<{ price_low: string; price: string }>;
}

export type DealSort = "Deal Rating" | "Title" | "Savings" | "Price" | "Metacritic" | "Release";

export interface SearchOptions {
  sortBy?: DealSort;
  desc?: number;
  storeId?: string;
  minDiscount?: number;
  maxPrice?: number;
  pageSize?: number;
}

async function fetchCheapShark<T>(endpoint: string): Promise<T> {
  if (Date.now() < cheapSharkGlobalBlockedUntil) {
    return [] as T;
  }
  if (cacheGet<boolean>(`cheapshark:blocked:${endpoint}`)) {
    return [] as T;
  }

  return cached(`cheapshark:${endpoint}`, 10 * 60 * 1000, async () => {
    try {
      const res = await fetch(`${CHEAPSHARK_BASE}${endpoint}`, {
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(5000),
      });
      if (res.status === 429) {
        console.warn("CheapShark rate limited:", endpoint);
        cheapSharkGlobalBlockedUntil = Date.now() + 5 * 60 * 1000;
        cacheSet(`cheapshark:blocked:${endpoint}`, true, 5 * 60 * 1000);
        return [] as T;
      }
      if (!res.ok) throw new Error(`CheapShark API error: ${res.status}`);
      return res.json();
    } catch (error) {
      console.error("CheapShark fetch failed:", endpoint, error);
      return [] as T;
    }
  });
}

async function withSteamFallback(
  cheapSharkFn: () => Promise<DealOfTheDay[]>,
  steamFn: () => Promise<DealOfTheDay[]>
): Promise<DealOfTheDay[]> {
  const cs = await cheapSharkFn();
  if (cs.length > 0) return cs;
  return steamFn();
}

function mapDealToSearchResult(deal: CheapSharkDeal): SearchResult {
  const platform = getPlatformByCheapSharkId(parseInt(deal.storeID));
  return {
    gameId: deal.gameID,
    title: deal.title,
    imageUrl: deal.thumb,
    steamAppId: deal.steamAppID || undefined,
    cheapestPrice: parseFloat(deal.salePrice),
    cheapestPlatform: platform?.name || "Unknown",
    maxDiscount: Math.round(parseFloat(deal.savings)),
    metacritic: deal.metacriticScore ? parseInt(deal.metacriticScore) : undefined,
    steamRating: deal.steamRatingPercent
      ? parseInt(deal.steamRatingPercent)
      : undefined,
    source: "cheapshark",
    platforms: ["steam", "epic", "gog"],
  };
}

function mapDealToDealOfDay(deal: CheapSharkDeal): DealOfTheDay {
  const platform = getPlatformByCheapSharkId(parseInt(deal.storeID));
  return {
    title: deal.title,
    gameId: deal.gameID,
    imageUrl: deal.thumb,
    normalPrice: parseFloat(deal.normalPrice),
    salePrice: parseFloat(deal.salePrice),
    discount: Math.round(parseFloat(deal.savings)),
    platformName: platform?.name || "Unknown",
    dealUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
  };
}

export async function searchGamesAdvanced(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const {
      sortBy = "Deal Rating",
      desc = 0,
      storeId,
      minDiscount,
      maxPrice,
      pageSize = 30,
    } = options;

    const platform = storeId ? getPlatformById(storeId) : undefined;
    const cheapSharkStoreId = platform?.cheapSharkId;

    let url = `/deals?title=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=${sortBy}`;
    if (desc) url += `&desc=${desc}`;
    if (cheapSharkStoreId) url += `&storeID=${cheapSharkStoreId}`;
    if (maxPrice) url += `&upperPrice=${maxPrice}`;

    const deals = await fetchCheapShark<CheapSharkDeal[]>(url);

    if (!Array.isArray(deals)) return [];

    const seen = new Set<string>();
    const results: SearchResult[] = [];

    for (const deal of deals) {
      if (seen.has(deal.gameID)) continue;
      const discount = Math.round(parseFloat(deal.savings));
      if (minDiscount && discount < minDiscount) continue;
      seen.add(deal.gameID);
      results.push(mapDealToSearchResult(deal));
    }

    return results;
  } catch {
    return [];
  }
}

export async function getDealsFiltered(options: SearchOptions = {}): Promise<DealOfTheDay[]> {
  const {
    sortBy = "Savings",
    desc = 1,
    storeId,
    minDiscount = 0,
    maxPrice = 60,
    pageSize = 24,
  } = options;

  const platform = storeId ? getPlatformById(storeId) : undefined;
  const storeIds = platform?.cheapSharkId
    ? String(platform.cheapSharkId)
    : "1,3,7,8,11,13,14,25";

  const url = `/deals?storeID=${storeIds}&upperPrice=${maxPrice}&pageSize=${pageSize}&sortBy=${sortBy}&desc=${desc}`;

  return withSteamFallback(
    async () => {
      const deals = await fetchCheapShark<CheapSharkDeal[]>(url);
      return deals
        .filter((d) => parseFloat(d.savings) >= minDiscount)
        .map(mapDealToDealOfDay);
    },
    async () => {
      let steam = await getSteamStoreDeals(pageSize + 12);
      if (storeId === "steam") {
        steam = steam.filter((d) => d.platformName === "Steam");
      }
      return steam
        .filter((d) => d.discount >= minDiscount && d.salePrice <= maxPrice)
        .slice(0, pageSize);
    }
  );
}

export async function getHomeDealsBundle(): Promise<{
  deals: DealOfTheDay[];
  popular: DealOfTheDay[];
  budgetDeals: DealOfTheDay[];
  freeGames: DealOfTheDay[];
}> {
  const mainDeals = await fetchCheapShark<CheapSharkDeal[]>(
    "/deals?storeID=1,3,7,8,11,13,14,25&pageSize=60&sortBy=Savings&desc=1"
  );

  if (mainDeals.length === 0) {
    const [steam, steamFree, epicFree] = await Promise.all([
      getSteamStoreDeals(48),
      getSteamFreeGames(),
      getEpicFreeGames(),
    ]);
    const freeGames = mergeFreeDeals(steamFree, epicFree);
    return {
      deals: steam.slice(0, 8),
      popular: steam.filter((d) => d.discount >= 50).slice(0, 8),
      budgetDeals: steam.filter((d) => d.salePrice <= 10 && d.discount >= 30).slice(0, 8),
      freeGames: freeGames.slice(0, 12),
    };
  }

  const deals = mainDeals.slice(0, 8).map(mapDealToDealOfDay);
  const popular = mainDeals
    .filter((d) => parseInt(d.metacriticScore || "0") >= 75)
    .slice(0, 8)
    .map(mapDealToDealOfDay);
  const budgetDeals = mainDeals
    .filter((d) => parseFloat(d.salePrice) <= 10 && parseFloat(d.savings) >= 30)
    .slice(0, 8)
    .map(mapDealToDealOfDay);

  const freeFromMain = mainDeals
    .filter((d) => parseFloat(d.salePrice) === 0)
    .slice(0, 12)
    .map(mapDealToDealOfDay);

  if (freeFromMain.length > 0) {
    const epicFree = await getEpicFreeGames();
    return { deals, popular, budgetDeals, freeGames: mergeFreeDeals(freeFromMain, epicFree) };
  }

  const [freeRaw, epicFree] = await Promise.all([
    fetchCheapShark<CheapSharkDeal[]>("/deals?upperPrice=0&pageSize=12&sortBy=Deal Rating"),
    getEpicFreeGames(),
  ]);
  const freeGames = mergeFreeDeals(freeRaw.map(mapDealToDealOfDay), epicFree);

  return { deals, popular, budgetDeals, freeGames };
}

function mergeFreeDeals(...lists: DealOfTheDay[][]): DealOfTheDay[] {
  const seen = new Set<string>();
  const merged: DealOfTheDay[] = [];
  for (const list of lists) {
    for (const deal of list) {
      const key = deal.gameId + deal.dealUrl;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(deal);
    }
  }
  return merged;
}

export async function getFreeGames(): Promise<DealOfTheDay[]> {
  const [base, epicFree] = await Promise.all([
    withSteamFallback(
      async () => {
        const deals = await fetchCheapShark<CheapSharkDeal[]>(
          "/deals?upperPrice=0&pageSize=12&sortBy=Deal Rating"
        );
        return deals.map(mapDealToDealOfDay);
      },
      () => getSteamFreeGames()
    ),
    getEpicFreeGames(),
  ]);
  return mergeFreeDeals(base, epicFree);
}

export async function getPopularDeals(): Promise<DealOfTheDay[]> {
  return withSteamFallback(
    async () => {
      const deals = await fetchCheapShark<CheapSharkDeal[]>(
        "/deals?storeID=1,25,7&pageSize=12&sortBy=Metacritic&desc=1"
      );
      return deals
        .filter((d) => parseInt(d.metacriticScore || "0") >= 75)
        .slice(0, 8)
        .map(mapDealToDealOfDay);
    },
    async () => {
      const steam = await getSteamStoreDeals(24);
      return steam.filter((d) => d.discount >= 40).slice(0, 8);
    }
  );
}

export async function getUnderPriceDeals(maxPrice: number): Promise<DealOfTheDay[]> {
  return withSteamFallback(
    async () => {
      const deals = await fetchCheapShark<CheapSharkDeal[]>(
        `/deals?upperPrice=${maxPrice}&pageSize=12&sortBy=Savings&desc=1`
      );
      return deals
        .filter((d) => parseFloat(d.savings) >= 30)
        .map(mapDealToDealOfDay);
    },
    () => getSteamUnderPriceDeals(maxPrice)
  );
}

export async function getMegaDeals(): Promise<DealOfTheDay[]> {
  return withSteamFallback(
    async () => {
      const deals = await fetchCheapShark<CheapSharkDeal[]>(
        "/deals?storeID=1,3,7,8,11,13,14,25&pageSize=30&sortBy=Savings&desc=1"
      );
      return deals
        .filter((d) => parseFloat(d.savings) >= 75)
        .slice(0, 24)
        .map(mapDealToDealOfDay);
    },
    () => getSteamMegaDeals()
  );
}

const HISTORICAL_LOW_TOLERANCE = 1.05;

export async function enrichDealsWithHistoricalLow(
  deals: DealOfTheDay[]
): Promise<DealOfTheDay[]> {
  const batch = deals.filter((d) => !d.gameId.startsWith("steam-")).slice(0, 12);
  if (batch.length === 0) return deals;

  const enrichedList = await mapWithConcurrency(batch, 3, async (deal) => {
    try {
      const data = await fetchCheapShark<CheapSharkGameLookup>(
        `/games?id=${deal.gameId}`
      );
      const historicalLow = parseFloat(
        data.deals?.[0]?.price_low || String(deal.salePrice)
      );
      const isHistoricalLow = deal.salePrice <= historicalLow * HISTORICAL_LOW_TOLERANCE;
      return { ...deal, historicalLow, isHistoricalLow };
    } catch {
      return deal;
    }
  });

  const enrichedMap = new Map(enrichedList.map((d) => [d.gameId, d]));
  return deals.map((d) => enrichedMap.get(d.gameId) ?? d);
}

export async function getHistoricalLowDeals(): Promise<DealOfTheDay[]> {
  const deals = await getDealsFiltered({
    minDiscount: 40,
    sortBy: "Savings",
    desc: 1,
    pageSize: 36,
  });
  const enriched = await enrichDealsWithHistoricalLow(deals);
  const historical = enriched.filter((d) => d.isHistoricalLow);
  if (historical.length > 0) return historical.slice(0, 24);
  return deals.filter((d) => d.discount >= 60).slice(0, 24);
}

export async function getBundleDeals(): Promise<BundleDeal[]> {
  const keywords = ["bundle", "pack", "collection"];
  const results: BundleDeal[] = [];
  const seen = new Set<string>();

  for (const keyword of keywords) {
    try {
      const deals = await fetchCheapShark<CheapSharkDeal[]>(
        `/deals?title=${keyword}&pageSize=15&sortBy=Savings&desc=1`
      );
      for (const deal of deals) {
        const key = deal.gameID + deal.dealID;
        if (seen.has(key)) continue;
        seen.add(key);
        const platform = getPlatformByCheapSharkId(parseInt(deal.storeID));
        results.push({
          title: deal.title,
          gameId: deal.gameID,
          imageUrl: deal.thumb,
          salePrice: parseFloat(deal.salePrice),
          normalPrice: parseFloat(deal.normalPrice),
          discount: Math.round(parseFloat(deal.savings)),
          platformName: platform?.name || "Unknown",
          dealUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
          store: platform?.shortName || "Store",
        });
      }
    } catch {
      // skip keyword
    }
  }

  return results
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 30);
}

export async function getSimilarGames(title: string): Promise<SearchResult[]> {
  const words = title.split(/\s+/).filter((w) => w.length > 3);
  const keyword = words[0] || title.split(" ")[0];
  if (!keyword) return [];

  const results = await searchGamesAdvanced(keyword, { pageSize: 15 });
  return results
    .filter((r) => r.title.toLowerCase() !== title.toLowerCase())
    .slice(0, 6);
}
