import { SearchResult } from "@/types";
import { resolveGameImage } from "@/lib/game-images";
import { searchCatalog } from "@/lib/services/catalog-search";

const MEILI_HOST = process.env.MEILISEARCH_HOST;
const MEILI_KEY = process.env.MEILISEARCH_API_KEY;
const MEILI_INDEX = process.env.MEILISEARCH_INDEX ?? "games";

export function isMeilisearchEnabled(): boolean {
  return Boolean(MEILI_HOST && MEILI_KEY);
}

export async function meiliSearch(query: string, limit = 60): Promise<SearchResult[]> {
  if (!isMeilisearchEnabled()) return searchCatalog(query, limit);

  try {
    const res = await fetch(`${MEILI_HOST}/indexes/${MEILI_INDEX}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_KEY}`,
      },
      body: JSON.stringify({ q: query, limit }),
      next: { revalidate: 60 },
    });
    if (!res.ok) return searchCatalog(query, limit);

    const data = (await res.json()) as {
      hits?: Array<{
        slug: string;
        title: string;
        imageUrl?: string;
        steamAppId?: string;
        cheapSharkId?: string;
        platforms?: string[];
        metacritic?: number;
      }>;
    };

    return (data.hits ?? []).map((hit) => ({
      gameId: hit.cheapSharkId || hit.slug,
      title: hit.title,
      imageUrl: resolveGameImage({
        imageUrl: hit.imageUrl,
        steamAppId: hit.steamAppId,
      }),
      steamAppId: hit.steamAppId,
      platforms: hit.platforms ?? (hit.steamAppId ? ["steam"] : []),
      metacritic: hit.metacritic,
      source: "catalog" as const,
      sources: ["catalog"],
    }));
  } catch {
    return searchCatalog(query, limit);
  }
}
