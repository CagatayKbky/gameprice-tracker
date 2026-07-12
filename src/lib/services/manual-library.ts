import { prisma } from "@/lib/db";

export type ManualPlatform = "epic" | "gog" | "xbox" | "playstation";

export async function listManualOwnedGames(sessionId: string, platform?: ManualPlatform) {
  return prisma.manualOwnedGame.findMany({
    where: {
      sessionId,
      ...(platform ? { platform } : {}),
    },
    orderBy: { title: "asc" },
  });
}

export async function importManualGames(
  sessionId: string,
  platform: ManualPlatform,
  titles: string[]
) {
  const normalized = [...new Set(titles.map((t) => t.trim()).filter(Boolean))];
  let imported = 0;

  for (const title of normalized) {
    try {
      await prisma.manualOwnedGame.upsert({
        where: {
          sessionId_platform_title: { sessionId, platform, title },
        },
        create: { sessionId, platform, title },
        update: {},
      });
      imported++;
    } catch {
      /* skip */
    }
  }

  return { imported, total: normalized.length };
}

export async function deleteManualGame(sessionId: string, id: string) {
  return prisma.manualOwnedGame.deleteMany({
    where: { id, sessionId },
  });
}

export async function getManualOwnedCount(sessionId: string) {
  const rows = await prisma.manualOwnedGame.groupBy({
    by: ["platform"],
    where: { sessionId },
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((r) => [r.platform, r._count._all])) as Record<string, number>;
}
