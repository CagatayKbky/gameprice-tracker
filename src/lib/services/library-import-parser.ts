import type { ManualPlatform } from "@/lib/services/manual-library";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (typeof item === "number") return String(item);
      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        return String(
          row.title ||
            row.name ||
            row.entitlementName ||
            row.catalogItemId ||
            row.gameTitle ||
            ""
        ).trim();
      }
      return "";
    })
    .filter((s) => s.length > 1);
}

export function parseLibraryImportText(
  platform: ManualPlatform,
  raw: string
): { titles: string[]; gogIds: number[] } {
  const trimmed = raw.trim();
  if (!trimmed) return { titles: [], gogIds: [] };

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const json = JSON.parse(trimmed) as unknown;
      return parseLibraryImportJson(platform, json);
    } catch {
      /* fall through to line parse */
    }
  }

  const titles = trimmed
    .split(/[\n,;]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 1);

  return { titles, gogIds: [] };
}

export function parseLibraryImportJson(
  platform: ManualPlatform,
  json: unknown
): { titles: string[]; gogIds: number[] } {
  const titles: string[] = [];
  const gogIds: number[] = [];

  if (Array.isArray(json)) {
    titles.push(...asStringArray(json));
    return { titles, gogIds };
  }

  if (!json || typeof json !== "object") {
    return { titles, gogIds };
  }

  const root = json as Record<string, unknown>;

  if (Array.isArray(root.owned)) {
    for (const id of root.owned) {
      const num = typeof id === "number" ? id : parseInt(String(id), 10);
      if (!Number.isNaN(num)) gogIds.push(num);
    }
  }

  if (Array.isArray(root.Entitlements)) {
    titles.push(...asStringArray(root.Entitlements));
  }

  if (Array.isArray(root.games)) {
    titles.push(...asStringArray(root.games));
  }

  if (Array.isArray(root.titles)) {
    titles.push(...asStringArray(root.titles));
  }

  for (const key of ["library", "Library", "data"]) {
    const nested = root[key];
    if (nested && typeof nested === "object") {
      const inner = parseLibraryImportJson(platform, nested);
      titles.push(...inner.titles);
      gogIds.push(...inner.gogIds);
    }
  }

  return {
    titles: [...new Set(titles)],
    gogIds: [...new Set(gogIds)],
  };
}

export async function resolveGogProductTitles(ids: number[]): Promise<string[]> {
  const titles: string[] = [];

  for (const id of ids.slice(0, 200)) {
    try {
      const res = await fetch(`https://embed.gog.com/account/gameDetails/${id}.json`, {
        signal: AbortSignal.timeout(6000),
        headers: { "User-Agent": "GamePrice/1.0" },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { title?: string };
      if (data.title?.trim()) titles.push(data.title.trim());
    } catch {
      /* skip */
    }
  }

  return titles;
}
