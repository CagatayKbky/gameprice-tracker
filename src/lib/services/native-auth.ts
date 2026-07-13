import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

const TTL_MS = 5 * 60 * 1000;

export async function createNativeAuthCode(sessionId: string) {
  const code = randomBytes(24).toString("hex");
  await prisma.nativeAuthCode.create({
    data: {
      code,
      sessionId,
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });
  return code;
}

export async function consumeNativeAuthCode(code: string) {
  const row = await prisma.nativeAuthCode.findUnique({ where: { code } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;

  await prisma.nativeAuthCode.update({
    where: { code },
    data: { usedAt: new Date() },
  });

  return row.sessionId;
}

export async function purgeExpiredNativeAuthCodes() {
  await prisma.nativeAuthCode.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  await prisma.nativeOAuthPending.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

export async function createNativeOAuthPending(sessionId: string, state: string) {
  await prisma.nativeOAuthPending.upsert({
    where: { state },
    create: {
      state,
      sessionId,
      expiresAt: new Date(Date.now() + TTL_MS),
    },
    update: {
      sessionId,
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });
}

export async function consumeNativeOAuthPending(state: string) {
  const row = await prisma.nativeOAuthPending.findUnique({ where: { state } });
  if (!row || row.expiresAt < new Date()) return null;
  await prisma.nativeOAuthPending.delete({ where: { state } });
  return row.sessionId;
}
