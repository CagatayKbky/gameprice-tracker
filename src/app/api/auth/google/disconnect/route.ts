import { NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST() {
  const sessionId = await getOrCreateSessionId();
  await prisma.userProfile.updateMany({
    where: { sessionId },
    data: { googleId: null, googleAvatar: null },
  });
  return NextResponse.json({ ok: true });
}
