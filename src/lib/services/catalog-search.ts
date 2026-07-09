import { prisma } from "@/lib/db";
import { SearchResult } from "@/types";
import { normalizeTitle, parsePlatforms } from "@/lib/catalog/utils";
import { resolveGameImage } from "@/lib/game-images";

const FEATURED_TITLES = [
  "Cyberpunk 2077",
  "Elden Ring",
  "Baldur's Gate 3",
  "Red Dead Redemption 2",
  "The Witcher 3",
  "Hogwarts Legacy",
  "Grand Theft Auto V",
  "Counter-Strike 2",
  "DOOM Eternal",
  "God of War",
  "Spider-Man",
  "Resident Evil 4",
  "Starfield",
  "Palworld",
  "Hades",
  "Stardew Valley",
];

interface CatalogGameRow {
  slug: string;
  title: string;
  titleNorm: string;
  imageUrl: string | null;
  steamAppId: string | null;
  rawgId: number | null;
  cheapSharkId: string | null;
  platforms: string;
  metacritic: number | null;
}

function toSearchResult(game: CatalogGameRow): SearchResult {
  const platforms = parsePlatforms(game.platforms);
  const gameId = game.cheapSharkId || game.slug;

  return {
    gameId,
    title: game.title,
    imageUrl: resolveGameImage({ imageUrl: game.imageUrl, steamAppId: game.steamAppId }),
    steamAppId: game.steamAppId || undefined,
    rawgId: game.rawgId || undefined,
    platforms: platforms.length ? platforms : game.steamAppId ? ["steam", "pc"] : platforms,
    metacritic: game.metacritic || undefined,
    source: "catalog",
    sources: ["catalog"],
  };
}

export interface CatalogLetterCount {
  letter: string;
  count: number;
}

export interface BrowseCatalogResult {
  games: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  letter: string;
}

export async function getCatalogCount(): Promise<number> {
  return prisma.catalogGame.count();
}

export async function searchCatalog(query: string, limit = 100): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const norm = normalizeTitle(trimmed);
  const games = await prisma.catalogGame.findMany({
    where: {
      OR: [
        { titleNorm: { contains: norm } },
        { title: { contains: trimmed } },
      ],
    },
    orderBy: [{ title: "asc" }],
    take: limit,
  });

  const exact = games.filter((g: CatalogGameRow) => g.titleNorm === norm);
  const prefix = games.filter(
    (g: CatalogGameRow) => g.titleNorm !== norm && g.titleNorm.startsWith(norm)
  );
  const rest = games.filter(
    (g: CatalogGameRow) => g.titleNorm !== norm && !g.titleNorm.startsWith(norm)
  );

  return [...exact, ...prefix, ...rest].map(toSearchResult);
}

export async function browseCatalog(options: {
  letter?: string;
  page?: number;
  pageSize?: number;
  platform?: string;
}): Promise<BrowseCatalogResult> {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(60, Math.max(12, options.pageSize || 48));
  const letter = (options.letter || "a").toLowerCase();
  const platform = options.platform?.trim();

  const letterFilter =
    letter === "all"
      ? {}
      : letter === "#"
        ? { letter: "#" }
        : { letter };

  const where = {
    ...letterFilter,
    ...(platform ? { platforms: { contains: `"${platform}"` } } : {}),
  };

  const [games, total] = await Promise.all([
    prisma.catalogGame.findMany({
      where,
      orderBy: { title: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.catalogGame.count({ where }),
  ]);

  return {
    games: games.map(toSearchResult),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    letter,
  };
}

export async function getCatalogLetters(): Promise<CatalogLetterCount[]> {
  const groups = await prisma.catalogGame.groupBy({
    by: ["letter"],
    _count: { letter: true },
    orderBy: { letter: "asc" },
  });

  return groups.map((g: { letter: string; _count: { letter: number } }) => ({
    letter: g.letter,
    count: g._count.letter,
  }));
}

export async function getFeaturedCatalogGames(limit = 16): Promise<SearchResult[]> {
  const found: SearchResult[] = [];
  const seen = new Set<string>();

  const games = await prisma.catalogGame.findMany({
    where: {
      OR: FEATURED_TITLES.flatMap((title) => [
        { title: { equals: title } },
        { title: { startsWith: `${title} ` } },
      ]),
    },
    orderBy: [{ metacritic: "desc" }, { title: "asc" }],
    take: limit * 3,
  });

  const byNorm = new Map(games.map((g) => [g.titleNorm, g]));

  for (const title of FEATURED_TITLES) {
    if (found.length >= limit) break;
    const norm = normalizeTitle(title);
    const game =
      games.find((g) => g.title === title) ||
      games.find((g) => g.titleNorm === norm) ||
      byNorm.get(norm);
    if (!game || seen.has(game.slug)) continue;
    seen.add(game.slug);
    found.push(toSearchResult(game));
  }

  if (found.length < limit) {
    const extra = await prisma.catalogGame.findMany({
      where: {
        metacritic: { gte: 85 },
        slug: { notIn: Array.from(seen) },
      },
      orderBy: { metacritic: "desc" },
      take: limit - found.length,
    });
    for (const game of extra) {
      found.push(toSearchResult(game));
    }
  }

  return found;
}

export async function getCatalogSample(limit = 12): Promise<SearchResult[]> {
  const games = await prisma.catalogGame.findMany({
    where: { steamAppId: { not: null } },
    orderBy: { title: "asc" },
    skip: Math.floor(Math.random() * 5000),
    take: limit,
  });
  return games.map(toSearchResult);
}
