import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
  }

  await prisma.userProfile.updateMany({
    where: { sessionId },
    data: {
      steamId: null,
      steamPersona: null,
      steamAvatar: null,
      profileSlug: null,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
