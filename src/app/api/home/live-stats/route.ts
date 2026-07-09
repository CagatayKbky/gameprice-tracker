import { NextResponse } from "next/server";
import { getHomeDealsBundle } from "@/lib/api/deals";

export async function GET() {
  try {
    const bundle = await getHomeDealsBundle();
    const all = [...bundle.deals, ...bundle.popular, ...bundle.freeGames];
    const maxDiscount = all.reduce((m, d) => Math.max(m, d.discount || 0), 0);
    return NextResponse.json({
      dealCount: all.filter((d) => d.discount > 0).length,
      maxDiscount,
      freeCount: bundle.freeGames.length,
    });
  } catch {
    return NextResponse.json({ dealCount: 0, maxDiscount: 0, freeCount: 0 });
  }
}
