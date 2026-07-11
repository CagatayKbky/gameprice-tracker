import { NextResponse } from "next/server";
import { getWeeklyLeaderboard } from "@/lib/services/leaderboard";

export async function GET() {
  const data = await getWeeklyLeaderboard(8);
  return NextResponse.json(data);
}
