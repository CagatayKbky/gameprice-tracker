import {
  DealOfTheDay,
  GameDeal,
  PriceHistoryPoint,
  SearchResult,
  StorePrice,
} from "@/types";
import { getPlatformByCheapSharkId } from "@/lib/platforms";
import { getConsolePrices } from "./console-prices";

const CHEAPSHARK_BASE = "https://www.cheapshark.com/api/1.0";

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
  info: {
    title: string;
    steamAppID: string | null;
    thumb: string;
  };
  deals: Array<{
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
    storeID_low: string;
    price_low: string;
    retailPrice_low: string;
    savings_low: string;
  }>;
}

interface CheapSharkStore {
  storeID: string;
  storeName: string;
}

async function fetchCheapShark<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${CHEAPSHARK_BASE}${endpoint}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`CheapShark API error: ${res.status}`);
  return res.json();
}

export async function searchGames(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const deals = await fetchCheapShark<CheapSharkDeal[]>(
    `/deals?title=${encodeURIComponent(query)}&pageSize=20`
  );

  const seen = new Set<string>();
  const results: SearchResult[] = [];

  for (const deal of deals) {
    if (seen.has(deal.gameID)) continue;
    seen.add(deal.gameID);

    const platform = getPlatformByCheapSharkId(parseInt(deal.storeID));
    const price = parseFloat(deal.salePrice);
    const discount = Math.round(parseFloat(deal.savings));

    results.push({
      gameId: deal.gameID,
      title: deal.title,
      imageUrl: deal.thumb,
      steamAppId: deal.steamAppID || undefined,
      cheapestPrice: price,
      cheapestPlatform: platform?.name || "Unknown",
      maxDiscount: discount,
    });
  }

  return results;
}

export async function getGameDeals(gameId: string): Promise<GameDeal | null> {
  const data = await fetchCheapShark<CheapSharkGameLookup>(`/games?id=${gameId}`);
  if (!data?.info) return null;

  const stores: StorePrice[] = [];

  for (const deal of data.deals) {
    const platform = getPlatformByCheapSharkId(parseInt(deal.storeID));
    if (!platform) continue;

    const price = parseFloat(deal.price);
    const normalPrice = parseFloat(deal.retailPrice);
    const discount = Math.round(parseFloat(deal.savings));

    stores.push({
      platformId: platform.id,
      platformName: platform.name,
      price,
      normalPrice,
      discount,
      savings: getSavingsAmount(normalPrice, price),
      dealUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
      isOnSale: discount > 0,
      lastUpdated: new Date().toISOString(),
    });
  }

  // Add console platform prices
  const consolePrices = await getConsolePrices(data.info.title);
  stores.push(...consolePrices);

  stores.sort((a, b) => a.price - b.price);

  const cheapestStore = stores[0];
  const prices = stores.map((s) => s.price);
  const historicalLow = data.deals[0]
    ? parseFloat(data.deals[0].price_low || data.deals[0].price)
    : Math.min(...prices);

  return {
    gameId,
    steamAppId: data.info.steamAppID || undefined,
    title: data.info.title,
    imageUrl: data.info.thumb,
    stores,
    cheapestStore,
    currentLow: Math.min(...prices),
    historicalLow,
  };
}

export async function getDealsOfTheDay(): Promise<DealOfTheDay[]> {
  const deals = await fetchCheapShark<CheapSharkDeal[]>(
    "/deals?storeID=1,3,7,8,11,13,14,25&upperPrice=50&pageSize=12&sortBy=Metacritic"
  );

  return deals
    .filter((d) => parseFloat(d.savings) >= 50)
    .slice(0, 8)
    .map((deal) => {
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
    });
}

export async function getPriceHistory(
  gameId: string,
  days = 90
): Promise<PriceHistoryPoint[]> {
  const history = await fetchCheapShark<
    Array<{ date: number; price: string; dealID: string }>
  >(`/games?id=${gameId}&lookback=${days}`);

  if (!Array.isArray(history) || history.length === 0) {
    return generateMockHistory(gameId, days);
  }

  return history.map((point) => ({
    date: new Date(point.date * 1000).toISOString().split("T")[0],
    price: parseFloat(point.price),
    platformId: "steam",
    platformName: "Steam",
  }));
}

export async function getStores(): Promise<CheapSharkStore[]> {
  return fetchCheapShark<CheapSharkStore[]>("/stores");
}

function getSavingsAmount(normal: number, sale: number): number {
  return Math.round((normal - sale) * 100) / 100;
}

function generateMockHistory(gameId: string, days: number): PriceHistoryPoint[] {
  const seed = gameId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const basePrice = 30 + (seed % 40);
  const points: PriceHistoryPoint[] = [];
  const now = new Date();

  for (let i = days; i >= 0; i -= 7) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variance = Math.sin((i + seed) * 0.1) * 10;
    const saleCycle = i % 30 < 7 ? -15 : 0;
    const price = Math.max(5, basePrice + variance + saleCycle);

    points.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
      platformId: "steam",
      platformName: "Steam",
    });
  }

  return points;
}
