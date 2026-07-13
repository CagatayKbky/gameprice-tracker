import { prisma } from "@/lib/db";
import {
  getCatalogLetter,
  isLikelyGame,
  normalizeTitle,
  parsePlatforms,
} from "@/lib/catalog/utils";
import { getSteamLibraryImage } from "@/lib/game-images";

const STEAM_LIST_URL =
  "https://raw.githubusercontent.com/dgibbs64/SteamCMD-AppID-List/master/steamcmd_appid.json";
const RAWG_BASE = "https://api.rawg.io/api";
const BATCH_SIZE = 1000;

interface SteamAppEntry {
  appid: number;
  name: string;
}

interface RawgListGame {
  id: number;
  name: string;
  background_image: string | null;
  metacritic: number | null;
  released: string | null;
  platforms?: Array<{ platform: { slug: string } }>;
  stores?: Array<{ store: { slug: string } }>;
}

const RAWG_PLATFORM_MAP: Record<string, string> = {
  steam: "steam",
  "xbox-series-x": "xbox-series",
  "xbox-one": "xbox-one",
  playstation5: "ps5",
  playstation4: "ps4",
  nintendo: "switch",
  gog: "gog",
  epic: "epic",
};

function mapRawgPlatforms(game: RawgListGame): string[] {
  const platforms = new Set<string>(["pc"]);

  for (const p of game.platforms || []) {
    const slug = p.platform?.slug || "";
    if (slug.includes("pc")) platforms.add("steam");
    const mapped = RAWG_PLATFORM_MAP[slug];
    if (mapped) platforms.add(mapped);
    if (slug.includes("xbox")) {
      platforms.add("xbox-series");
      platforms.add("xbox-one");
    }
    if (slug.includes("playstation")) {
      platforms.add("ps5");
      platforms.add("ps4");
    }
    if (slug.includes("nintendo")) platforms.add("switch");
  }

  for (const s of game.stores || []) {
    const storeSlug = s.store?.slug || "";
    if (storeSlug === "steam") platforms.add("steam");
    if (storeSlug === "epic-games") platforms.add("epic");
    if (storeSlug === "gog") platforms.add("gog");
  }

  return Array.from(platforms);
}

async function getSyncState() {
  return prisma.catalogSyncState.upsert({
    where: { id: "main" },
    create: { id: "main" },
    update: {},
  });
}

async function updateTotalGames() {
  const totalGames = await prisma.catalogGame.count();
  await prisma.catalogSyncState.update({
    where: { id: "main" },
    data: { totalGames, updatedAt: new Date() },
  });
  return totalGames;
}

async function insertBatch(
  batch: Array<{
    slug: string;
    title: string;
    titleNorm: string;
    letter: string;
    steamAppId?: string;
    rawgId?: number;
    imageUrl?: string;
    platforms: string;
    source: string;
    metacritic?: number;
    released?: string;
  }>
) {
  if (!batch.length) return 0;

  try {
    const result = await prisma.catalogGame.createMany({ data: batch });
    return result.count;
  } catch {
    let count = 0;
    for (const item of batch) {
      try {
        await prisma.catalogGame.upsert({
          where: { slug: item.slug },
          create: item,
          update: {
            title: item.title,
            titleNorm: item.titleNorm,
            letter: item.letter,
            imageUrl: item.imageUrl,
            platforms: item.platforms,
            metacritic: item.metacritic,
            released: item.released,
            updatedAt: new Date(),
          },
        });
        count += 1;
      } catch {
        // skip invalid rows
      }
    }
    return count;
  }
}

export async function syncSteamCatalog(force = false): Promise<number> {
  const state = await getSyncState();
  if (state.steamDone && !force) {
    return state.totalGames;
  }

  const res = await fetch(STEAM_LIST_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Steam list download failed: ${res.status}`);
  }

  const data = await res.json();
  const apps: SteamAppEntry[] = data?.applist?.apps || [];
  let batch: Parameters<typeof insertBatch>[0] = [];

  for (const app of apps) {
    if (!app?.appid || !isLikelyGame(app.name)) continue;

    const title = app.name.trim();
    const titleNorm = normalizeTitle(title);
    if (!titleNorm) continue;

    batch.push({
      slug: `steam-${app.appid}`,
      title,
      titleNorm,
      letter: getCatalogLetter(titleNorm),
      steamAppId: String(app.appid),
      imageUrl: getSteamLibraryImage(String(app.appid)),
      platforms: JSON.stringify(["steam", "pc"]),
      source: "steam",
    });

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch);
      batch = [];
    }
  }

  if (batch.length) {
    await insertBatch(batch);
  }

  const totalGames = await updateTotalGames();
  await prisma.catalogSyncState.update({
    where: { id: "main" },
    data: { steamDone: true, totalGames, updatedAt: new Date() },
  });

  return totalGames;
}

export async function syncRawgCatalogPages(maxPages = 50): Promise<number> {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) return 0;

  const state = await getSyncState();
  if (state.rawgDone) return state.totalGames;

  let page = state.rawgPage;
  let pagesSynced = 0;

  while (pagesSynced < maxPages) {
    const res = await fetch(
      `${RAWG_BASE}/games?key=${apiKey}&page=${page}&page_size=40&ordering=name`,
      { cache: "no-store" }
    );
    if (!res.ok) break;

    const data = await res.json();
    const results: RawgListGame[] = data?.results || [];
    if (!results.length) {
      await prisma.catalogSyncState.update({
        where: { id: "main" },
        data: { rawgDone: true, updatedAt: new Date() },
      });
      break;
    }

    const batch: Parameters<typeof insertBatch>[0] = [];

    for (const game of results) {
      const title = game.name?.trim();
      if (!title) continue;

      const titleNorm = normalizeTitle(title);
      const platforms = mapRawgPlatforms(game);

      batch.push({
        slug: `rawg-${game.id}`,
        title,
        titleNorm,
        letter: getCatalogLetter(titleNorm),
        rawgId: game.id,
        imageUrl: game.background_image || undefined,
        platforms: JSON.stringify(platforms),
        source: "rawg",
        metacritic: game.metacritic || undefined,
        released: game.released || undefined,
      });
    }

    await insertBatch(batch);
    page += 1;
    pagesSynced += 1;

    await prisma.catalogSyncState.update({
      where: { id: "main" },
      data: { rawgPage: page, updatedAt: new Date() },
    });

    if (!data.next) {
      await prisma.catalogSyncState.update({
        where: { id: "main" },
        data: { rawgDone: true, updatedAt: new Date() },
      });
      break;
    }
  }

  const totalGames = await updateTotalGames();
  return totalGames;
}

export async function runCatalogSync(options?: {
  forceSteam?: boolean;
  rawgPages?: number;
}) {
  const steamTotal = await syncSteamCatalog(options?.forceSteam);
  const rawgTotal = await syncRawgCatalogPages(options?.rawgPages ?? 25);
  const totalGames = await prisma.catalogGame.count();

  return {
    steamTotal,
    rawgTotal,
    totalGames,
    rawgEnabled: Boolean(process.env.RAWG_API_KEY),
  };
}

export async function getCatalogSyncStatus() {
  const [state, totalGames, letterCounts] = await Promise.all([
    getSyncState(),
    prisma.catalogGame.count(),
    prisma.catalogGame.groupBy({
      by: ["letter"],
      _count: { letter: true },
      orderBy: { letter: "asc" },
    }),
  ]);

  return {
    ...state,
    totalGames,
    letters: letterCounts.map((item) => ({
      letter: item.letter,
      count: item._count.letter,
    })),
    rawgEnabled: Boolean(process.env.RAWG_API_KEY),
  };
}

export async function enrichCatalogFromRawgSearch(query: string) {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey || !query.trim()) return 0;

  const res = await fetch(
    `${RAWG_BASE}/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=40`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return 0;

  const data = await res.json();
  const results: RawgListGame[] = data?.results || [];
  const batch = results
    .filter((game) => game.name)
    .map((game) => {
      const title = game.name.trim();
      const titleNorm = normalizeTitle(title);
      return {
        slug: `rawg-${game.id}`,
        title,
        titleNorm,
        letter: getCatalogLetter(titleNorm),
        rawgId: game.id,
        imageUrl: game.background_image || undefined,
        platforms: JSON.stringify(mapRawgPlatforms(game)),
        source: "rawg",
        metacritic: game.metacritic || undefined,
        released: game.released || undefined,
      };
    });

  return insertBatch(batch);
}

export function catalogGameToPlatforms(value: string): string[] {
  return parsePlatforms(value);
}

/** Fill missing Steam library images for catalog rows (batched). */
export async function backfillSteamCatalogImages(batchSize = 500) {
  const rows = await prisma.catalogGame.findMany({
    where: {
      steamAppId: { not: null },
      OR: [{ imageUrl: null }, { imageUrl: "" }],
    },
    select: { id: true, steamAppId: true },
    take: batchSize,
  });

  await Promise.all(
    rows.map((row) =>
      prisma.catalogGame.update({
        where: { id: row.id },
        data: { imageUrl: getSteamLibraryImage(row.steamAppId!) },
      })
    )
  );

  const remaining = await prisma.catalogGame.count({
    where: {
      steamAppId: { not: null },
      OR: [{ imageUrl: null }, { imageUrl: "" }],
    },
  });

  return { updated: rows.length, remaining };
}
