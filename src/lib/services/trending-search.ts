import { prisma } from "@/lib/db";
import { normalizeTitle } from "@/lib/catalog/utils";

export async function logSearch(query: string, sessionId?: string) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return;

  const queryNorm = normalizeTitle(trimmed);
  await prisma.searchLog.create({
    data: { query: trimmed, queryNorm, sessionId },
  });
}

export async function getTrendingSearches(limit = 10) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const logs = await prisma.searchLog.groupBy({
    by: ["queryNorm"],
    where: { createdAt: { gte: since } },
    _count: { queryNorm: true },
    orderBy: { _count: { queryNorm: "desc" } },
    take: limit * 2,
  });

  const results: { query: string; count: number }[] = [];

  for (const row of logs) {
    const latest = await prisma.searchLog.findFirst({
      where: { queryNorm: row.queryNorm },
      orderBy: { createdAt: "desc" },
      select: { query: true },
    });
    if (!latest) continue;
    results.push({ query: latest.query, count: row._count.queryNorm });
    if (results.length >= limit) break;
  }

  return results;
}
