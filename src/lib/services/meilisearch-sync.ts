import { prisma } from "@/lib/db";
import { parsePlatforms } from "@/lib/catalog/utils";

const BATCH_SIZE = 1000;

function getConfig() {
  const host = process.env.MEILISEARCH_HOST?.replace(/\/$/, "");
  const apiKey = process.env.MEILISEARCH_API_KEY;
  const index = process.env.MEILISEARCH_INDEX ?? "games";
  if (!host || !apiKey) return null;
  return { host, apiKey, index };
}

async function meiliFetch(
  path: string,
  options: RequestInit & { apiKey: string; host: string }
) {
  const res = await fetch(`${options.host}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
      ...options.headers,
    },
    cache: "no-store",
  });
  return res;
}

export async function ensureMeiliIndex(): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  const existing = await meiliFetch(`/indexes/${config.index}`, {
    method: "GET",
    apiKey: config.apiKey,
    host: config.host,
  });

  if (existing.status === 404) {
    const create = await meiliFetch("/indexes", {
      method: "POST",
      apiKey: config.apiKey,
      host: config.host,
      body: JSON.stringify({ uid: config.index, primaryKey: "slug" }),
    });
    if (!create.ok) {
      throw new Error(`Meilisearch index create failed: ${create.status}`);
    }
  } else if (!existing.ok) {
    throw new Error(`Meilisearch index check failed: ${existing.status}`);
  }

  const settings = await meiliFetch(`/indexes/${config.index}/settings`, {
    method: "PATCH",
    apiKey: config.apiKey,
    host: config.host,
    body: JSON.stringify({
      searchableAttributes: ["title", "titleNorm"],
      displayedAttributes: [
        "slug",
        "title",
        "titleNorm",
        "imageUrl",
        "steamAppId",
        "cheapSharkId",
        "platforms",
        "metacritic",
      ],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
        "metacritic:desc",
      ],
    }),
  });

  if (!settings.ok) {
    throw new Error(`Meilisearch settings failed: ${settings.status}`);
  }

  return true;
}

export async function syncMeilisearchCatalog(options?: {
  batchSize?: number;
  maxBatches?: number;
}) {
  const config = getConfig();
  if (!config) {
    return { ok: false as const, error: "MEILISEARCH_HOST or MEILISEARCH_API_KEY missing" };
  }

  await ensureMeiliIndex();

  const batchSize = options?.batchSize ?? BATCH_SIZE;
  const maxBatches = options?.maxBatches ?? Infinity;
  let cursor: string | undefined;
  let batches = 0;
  let indexed = 0;

  while (batches < maxBatches) {
    const games = await prisma.catalogGame.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        titleNorm: true,
        imageUrl: true,
        steamAppId: true,
        cheapSharkId: true,
        platforms: true,
        metacritic: true,
      },
    });

    if (!games.length) break;

    const documents = games.map((game) => {
      const platforms = parsePlatforms(game.platforms);
      return {
        slug: game.slug,
        title: game.title,
        titleNorm: game.titleNorm,
        imageUrl: game.imageUrl ?? undefined,
        steamAppId: game.steamAppId ?? undefined,
        cheapSharkId: game.cheapSharkId ?? undefined,
        platforms: platforms.length ? platforms : game.steamAppId ? ["steam", "pc"] : platforms,
        metacritic: game.metacritic ?? undefined,
      };
    });

    const res = await meiliFetch(`/indexes/${config.index}/documents`, {
      method: "POST",
      apiKey: config.apiKey,
      host: config.host,
      body: JSON.stringify(documents),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Meilisearch document upload failed: ${res.status} ${body}`);
    }

    indexed += documents.length;
    batches += 1;
    cursor = games[games.length - 1].id;

    if (games.length < batchSize) break;
  }

  return {
    ok: true as const,
    indexed,
    batches,
    index: config.index,
    host: config.host,
  };
}

export function isMeilisearchConfigured(): boolean {
  return Boolean(getConfig());
}
