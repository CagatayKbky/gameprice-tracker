import { SearchResult, GameDeal, StorePrice, PlatformMatrixItem } from "@/types";
import { searchGamesAdvanced } from "@/lib/api/deals";
import { searchSteamStore } from "@/lib/api/steam-search";
import { searchRawg, type RawgSearchOptions } from "@/lib/api/rawg";
import { getGameDeals } from "@/lib/api/cheapshark";
import { getSteamGameDetails, getSteamStoreUrl } from "@/lib/api/steam";
import { getConsolePrices } from "@/lib/api/console-prices";
import { getPlatformById, PLATFORMS } from "@/lib/platforms";
import { getStoreSearchUrl } from "@/lib/store-urls";
import { getSavingsAmount } from "@/lib/utils";
import { normalizeTitle } from "@/lib/catalog/utils";
import { searchCatalog, getCatalogCount } from "@/lib/services/catalog-search";
import { meiliSearch, isMeilisearchEnabled } from "@/lib/api/meilisearch";
import { enrichCatalogFromRawgSearch } from "@/lib/services/catalog-sync";

async function ensureCatalogSeeded() {
  const count = await getCatalogCount();
  if (count > 5000) return;

  const { runCatalogSync } = await import("@/lib/services/catalog-sync");
  runCatalogSync().catch((error) => {
    console.error("Background catalog sync failed:", error);
  });
}

function mergeSearchResults(...lists: SearchResult[][]): SearchResult[] {
  const map = new Map<string, SearchResult>();

  for (const list of lists) {
    for (const game of list) {
      const key = normalizeTitle(game.title);
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          ...game,
          sources: game.source ? [game.source] : [],
        });
        continue;
      }

      const preferId =
        !existing.gameId.startsWith("steam-") && !existing.gameId.startsWith("rawg-")
          ? existing.gameId
          : !game.gameId.startsWith("steam-") && !game.gameId.startsWith("rawg-")
            ? game.gameId
            : existing.gameId;

      map.set(key, {
        ...existing,
        gameId: preferId,
        imageUrl: existing.imageUrl || game.imageUrl,
        steamAppId: existing.steamAppId || game.steamAppId,
        cheapestPrice:
          existing.cheapestPrice !== undefined && game.cheapestPrice !== undefined
            ? Math.min(existing.cheapestPrice, game.cheapestPrice)
            : existing.cheapestPrice ?? game.cheapestPrice,
        cheapestPlatform:
          (existing.cheapestPrice ?? Infinity) <= (game.cheapestPrice ?? Infinity)
            ? existing.cheapestPlatform
            : game.cheapestPlatform,
        maxDiscount: Math.max(existing.maxDiscount || 0, game.maxDiscount || 0),
        metacritic: existing.metacritic || game.metacritic,
        platforms: Array.from(
          new Set([...(existing.platforms || []), ...(game.platforms || [])])
        ),
        sources: Array.from(
          new Set([...(existing.sources || []), ...(game.source ? [game.source] : [])])
        ),
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const priceA = a.cheapestPrice ?? Infinity;
    const priceB = b.cheapestPrice ?? Infinity;
    if (priceA !== priceB) return priceA - priceB;
    return a.title.localeCompare(b.title, "tr");
  });
}

export interface UnifiedSearchOptions extends RawgSearchOptions {
  minDiscount?: number;
  maxPrice?: number;
}

export async function unifiedSearch(
  query: string,
  options: UnifiedSearchOptions = {}
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  await ensureCatalogSeeded();

  const catalogSearch = isMeilisearchEnabled() ? meiliSearch : searchCatalog;

  const [catalog, cheapshark, steam, rawg] = await Promise.all([
    catalogSearch(query, 120),
    searchGamesAdvanced(query, { pageSize: 60 }),
    searchSteamStore(query),
    searchRawg(query, options),
  ]);

  if (process.env.RAWG_API_KEY && catalog.length < 20) {
    enrichCatalogFromRawgSearch(query).catch(() => {});
  }

  return mergeSearchResults(catalog, cheapshark, steam, rawg).map((g) => ({
    ...g,
    platforms:
      g.platforms?.length
        ? g.platforms
        : !g.gameId.startsWith("steam-") && !g.gameId.startsWith("rawg-")
          ? ["steam", "epic", "gog"]
          : g.steamAppId
            ? ["steam"]
            : [],
  }));
}

export async function resolveGame(gameId: string): Promise<GameDeal | null> {
  if (gameId.startsWith("steam-")) {
    return resolveSteamGame(gameId.replace("steam-", ""));
  }
  if (gameId.startsWith("rawg-")) {
    return resolveRawgGame(parseInt(gameId.replace("rawg-", "")));
  }
  return getGameDeals(gameId);
}

async function resolveSteamGame(appId: string): Promise<GameDeal | null> {
  const steam = await getSteamGameDetails(appId);
  if (!steam) return null;

  const stores: StorePrice[] = [];

  if (steam.price) {
    const priceUsd =
      steam.price.currency === "TRY"
        ? Math.round((steam.price.final / 34.5) * 100) / 100
        : steam.price.final;
    const normalUsd =
      steam.price.currency === "TRY"
        ? Math.round((steam.price.initial / 34.5) * 100) / 100
        : steam.price.initial;

    stores.push({
      platformId: "steam",
      platformName: "Steam Türkiye",
      price: priceUsd,
      normalPrice: normalUsd,
      discount: steam.price.discount,
      savings: getSavingsAmount(normalUsd, priceUsd),
      dealUrl: getSteamStoreUrl(appId),
      isOnSale: steam.price.discount > 0,
      lastUpdated: new Date().toISOString(),
    });
  }

  const [csResults, consoles] = await Promise.all([
    searchGamesAdvanced(steam.name, { pageSize: 5 }),
    getConsolePrices(steam.name),
  ]);

  const match = csResults.find(
    (r) =>
      !r.gameId.startsWith("steam-") &&
      normalizeTitle(r.title) === normalizeTitle(steam.name)
  );

  if (match) {
    const csGame = await getGameDeals(match.gameId);
    if (csGame) {
      for (const store of csGame.stores) {
        if (!stores.some((s) => s.platformId === store.platformId)) {
          stores.push(store);
        }
      }
    }
  }

  for (const c of consoles) {
    if (!stores.some((s) => s.platformId === c.platformId)) stores.push(c);
  }

  const enriched = await enrichStorePrices(steam.name, stores);
  enriched.sort((a, b) => a.price - b.price);
  const priced = enriched.filter((s) => s.price > 0);

  return {
    gameId: `steam-${appId}`,
    steamAppId: appId,
    title: steam.name,
    imageUrl: steam.headerImage,
    metacritic: steam.metacritic,
    stores: enriched,
    cheapestStore: priced[0] || enriched[0],
    currentLow: priced[0]?.price,
    historicalLow: priced[0]?.price,
  };
}

async function resolveRawgGame(rawgId: number): Promise<GameDeal | null> {
  const { getRawgGame } = await import("@/lib/api/rawg");
  const rawg = await getRawgGame(rawgId);
  if (!rawg) return null;

  const csResults = await searchGamesAdvanced(rawg.name, { pageSize: 5 });
  const match = csResults.find(
    (r) =>
      !r.gameId.startsWith("rawg-") &&
      normalizeTitle(r.title) === normalizeTitle(rawg.name)
  );

  if (match) {
    const game = await getGameDeals(match.gameId);
    if (game) return game;
  }

  const steamResults = await searchSteamStore(rawg.name);
  const steamMatch = steamResults.find(
    (r) => normalizeTitle(r.title) === normalizeTitle(rawg.name)
  );

  if (steamMatch?.steamAppId) {
    return resolveSteamGame(steamMatch.steamAppId);
  }

  const consoles = await getConsolePrices(rawg.name);
  const storeLinks = await enrichStorePrices(rawg.name, consoles);

  return {
    gameId: `rawg-${rawgId}`,
    title: rawg.name,
    imageUrl: rawg.background_image || undefined,
    metacritic: rawg.metacritic || undefined,
    stores: storeLinks,
    cheapestStore: storeLinks.find((s) => s.price > 0) || storeLinks[0],
    currentLow: storeLinks.find((s) => s.price > 0)?.price,
    historicalLow: storeLinks.find((s) => s.price > 0)?.price,
  };
}

function buildStoreSearchLinks(title: string): StorePrice[] {
  return [];
}

export async function enrichStorePrices(title: string, existing: StorePrice[]): Promise<StorePrice[]> {
  const { searchEpicStore } = await import("@/lib/api/epic");
  const { searchGogStore } = await import("@/lib/api/gog");
  const [epic, gog] = await Promise.all([searchEpicStore(title), searchGogStore(title)]);
  const merged = [...existing];

  for (const store of [...epic, ...gog]) {
    if (!merged.some((s) => s.platformId === store.platformId)) {
      merged.push(store);
    }
  }

  const pcPlatforms = ["ea", "ubisoft", "humble", "greenmangaming", "gamersgate"];
  for (const platformId of pcPlatforms) {
    if (merged.some((s) => s.platformId === platformId)) continue;
    const platform = getPlatformById(platformId);
    if (!platform) continue;
    merged.push({
      platformId,
      platformName: platform.name,
      price: 0,
      normalPrice: 0,
      discount: 0,
      savings: 0,
      dealUrl: getStoreSearchUrl(platformId, title),
      isOnSale: false,
      lastUpdated: new Date().toISOString(),
      isSearchLink: true,
    });
  }

  return merged;
}

export function buildFullPlatformMatrix(
  gameTitle: string,
  existingStores: StorePrice[]
): PlatformMatrixItem[] {
  const storeMap = new Map(existingStores.map((s) => [s.platformId, s]));

  return PLATFORMS.filter((p) => p.category !== "subscription").map((platform) => {
    const existing = storeMap.get(platform.id);
    if (existing && existing.price > 0) {
      return { ...existing, status: "priced" as const };
    }
    if (existing?.dealUrl) {
      return {
        ...existing,
        status: existing.price > 0 ? ("priced" as const) : ("search" as const),
      };
    }
    return {
      platformId: platform.id,
      platformName: platform.name,
      price: 0,
      normalPrice: 0,
      discount: 0,
      savings: 0,
      dealUrl: getStoreSearchUrl(platform.id, gameTitle),
      isOnSale: false,
      lastUpdated: new Date().toISOString(),
      isSearchLink: true,
      status: "search" as const,
    };
  });
}
