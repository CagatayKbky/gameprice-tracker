import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminTimeSeries } from "@/lib/services/admin-analytics";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const days = Math.min(90, Math.max(7, parseInt(request.nextUrl.searchParams.get("days") || "30", 10) || 30));
  const data = await getAdminTimeSeries(days);
  return NextResponse.json(data);
}
