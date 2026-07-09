import { NextRequest, NextResponse } from "next/server";
import { checkWishlistDealAlerts } from "@/lib/services/wishlist-alerts";
import { authorizeCron } from "@/lib/cron-auth";
import { logJobFinish, logJobStart } from "@/lib/services/job-log";

async function run() {
  return checkWishlistDealAlerts();
}

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const job = await logJobStart("wishlist-deals");
    const result = await run();
    await logJobFinish(job.id, "success", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Wishlist deals cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const job = await logJobStart("wishlist-deals");
    const result = await run();
    await logJobFinish(job.id, "success", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Wishlist deals cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
