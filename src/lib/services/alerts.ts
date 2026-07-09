import { prisma } from "@/lib/db";
import { PriceAlertData } from "@/types";
import { assertAlertCapacity } from "@/lib/premium/access";

export async function getAlerts(sessionId: string): Promise<PriceAlertData[]> {
  const alerts = await prisma.priceAlert.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
  });

  return alerts.map((a) => ({
    id: a.id,
    cheapSharkGameId: a.cheapSharkGameId,
    gameTitle: a.gameTitle,
    targetPrice: a.targetPrice,
    currentPrice: a.currentPrice,
    platformId: a.platformId,
    isActive: a.isActive,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function createAlert(
  sessionId: string,
  data: {
    cheapSharkGameId: string;
    gameTitle: string;
    targetPrice: number;
    currentPrice?: number;
    platformId?: string;
  }
) {
  const capacity = await assertAlertCapacity(sessionId);
  if (!capacity.ok) {
    const err = new Error("alert_limit") as Error & { code?: string; limit?: number };
    err.code = "alert_limit";
    err.limit = capacity.limit;
    throw err;
  }

  return prisma.priceAlert.create({
    data: {
      sessionId,
      cheapSharkGameId: data.cheapSharkGameId,
      gameTitle: data.gameTitle,
      targetPrice: data.targetPrice,
      currentPrice: data.currentPrice,
      platformId: data.platformId,
    },
  });
}

export async function deleteAlert(sessionId: string, alertId: string) {
  return prisma.priceAlert.deleteMany({
    where: { id: alertId, sessionId },
  });
}

export async function getActiveAlertCount(sessionId: string) {
  return prisma.priceAlert.count({
    where: { sessionId, isActive: true },
  });
}
