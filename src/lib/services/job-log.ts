import { prisma } from "@/lib/db";

export type JobType =
  | "sync-prices"
  | "sync-catalog"
  | "sync-meilisearch"
  | "weekly-digest"
  | "wishlist-deals"
  | "alert-check"
  | "free-games";

export async function logJobStart(type: JobType, meta?: Record<string, unknown>) {
  return prisma.jobLog.create({
    data: {
      type,
      status: "running",
      meta: meta ? JSON.stringify(meta) : null,
    },
  });
}

export async function logJobFinish(
  id: string,
  status: "success" | "error",
  result?: Record<string, unknown>,
  error?: string
) {
  return prisma.jobLog.update({
    where: { id },
    data: {
      status,
      finishedAt: new Date(),
      result: result ? JSON.stringify(result) : null,
      error: error ?? null,
    },
  });
}

export async function getRecentJobLogs(limit = 20) {
  return prisma.jobLog.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}
