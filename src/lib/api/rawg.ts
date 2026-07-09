import { SearchResult } from "@/types";

const RAWG_BASE = "https://api.rawg.io/api";

export interface RawgSearchOptions {
  genre?: string;
  year?: string;
  minMetacritic?: number;
  pageSize?: number;
}

interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  metacritic: number | null;
  platforms: Array<{ platform: { slug: string; name: string } }>;
  stores: Array<{ store: { slug: string; name: string } }>;
}

interface RawgSearchResponse {
  count: number;
  results: RawgGame[];
}

const PLATFORM_SLUG_MAP: Record<string, string> = {
  steam: "steam",
  "xbox-series-x": "xbox-series",
  "xbox-one": "xbox-one",
  playstation5: "ps5",
  playstation4: "ps4",
  nintendo: "switch",
  gog: "gog",
  epic: "epic",
};

export async function searchRawg(
  query: string,
  options: RawgSearchOptions = {}
): Promise<SearchResult[]> {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey || !query.trim()) return [];

  const { genre, year, minMetacritic, pageSize = 20 } = options;

  try {
    let url = `${RAWG_BASE}/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=${pageSize}`;
    if (genre) url += `&genres=${encodeURIComponent(genre)}`;
    if (year) url += `&dates=${year}-01-01,${year}-12-31`;
    if (minMetacritic) url += `&metacritic=${minMetacritic},100`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data: RawgSearchResponse = await res.json();

    return (data.results || []).map((game) => ({
      gameId: `rawg-${game.id}`,
      title: game.name,
      imageUrl: game.background_image || undefined,
      metacritic: game.metacritic || undefined,
      source: "rawg" as const,
      platforms: mapRawgPlatforms(game),
      rawgId: game.id,
    }));
  } catch {
    return [];
  }
}

export async function getRawgGame(id: number): Promise<RawgGame | null> {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${RAWG_BASE}/games/${id}?key=${apiKey}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function mapRawgPlatforms(game: RawgGame): string[] {
  const platforms = new Set<string>();

  for (const p of game.platforms || []) {
    const slug = p.platform?.slug || "";
    if (slug.includes("pc")) platforms.add("steam");
    const mapped = PLATFORM_SLUG_MAP[slug];
    if (mapped) platforms.add(mapped);
    if (slug.includes("xbox")) {
      platforms.add("xbox-series");
      platforms.add("xbox-one");
    }
    if (slug.includes("playstation")) {
      platforms.add("ps5");
      platforms.add("ps4");
    }
  }

  for (const s of game.stores || []) {
    const storeSlug = s.store?.slug || "";
    if (storeSlug === "steam") platforms.add("steam");
    if (storeSlug === "epic-games") platforms.add("epic");
    if (storeSlug === "gog") platforms.add("gog");
  }

  return Array.from(platforms);
}
