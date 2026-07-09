import { NextRequest, NextResponse } from "next/server";
import { notifyFreeGames } from "@/lib/services/free-game-notify";
import { authorizeCron } from "@/lib/cron-auth";
import { logJobFinish, logJobStart } from "@/lib/services/job-log";

async function run() {
  return notifyFreeGames();
}

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const job = await logJobStart("free-games");
    const result = await run();
    await logJobFinish(job.id, "success", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Free games cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
