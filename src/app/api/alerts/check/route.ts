import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { checkAndTriggerAlerts } from "@/lib/services/price-sync";
import { prisma } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  const result = await checkAndTriggerAlerts();

  let triggered: Array<{
    cheapSharkGameId: string;
    gameTitle: string;
    targetPrice: number;
  }> = [];

  if (sessionId) {
    const recent = await prisma.priceAlert.findMany({
      where: {
        sessionId,
        triggeredAt: { gte: new Date(Date.now() - 120_000) },
      },
      select: {
        cheapSharkGameId: true,
        gameTitle: true,
        targetPrice: true,
      },
    });
    triggered = recent;
  }

  return NextResponse.json({ ...result, triggered });
}
