import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { prisma } from "@/lib/db";
import { checkWishlistSubscriptions } from "@/lib/services/subscription-check";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ items: [] });
  }

  const wishlist = await prisma.wishlistItem.findMany({
    where: { sessionId },
    orderBy: { addedAt: "desc" },
    take: 20,
  });

  const items = await checkWishlistSubscriptions(wishlist);
  const onSubscription = items.filter((i) => i.gamepass || i.psplus);

  return NextResponse.json({
    items,
    onSubscription,
    summary: {
      total: wishlist.length,
      gamepass: items.filter((i) => i.gamepass).length,
      psplus: items.filter((i) => i.psplus).length,
    },
  });
}
