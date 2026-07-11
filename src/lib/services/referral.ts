import { prisma } from "@/lib/db";
import { grantUserCosmetic } from "@/lib/services/profile-cosmetics";

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function ensureReferralCode(sessionId: string): Promise<string> {
  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile) {
    const created = await prisma.userProfile.create({
      data: { sessionId, referralCode: randomCode() },
    });
    return created.referralCode!;
  }
  if (profile.referralCode) return profile.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      const updated = await prisma.userProfile.update({
        where: { sessionId },
        data: { referralCode: code },
      });
      return updated.referralCode!;
    } catch {
      /* collision */
    }
  }
  throw new Error("referral_code_failed");
}

export async function applyReferralCode(sessionId: string, code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false as const, error: "invalid_code" };

  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile) return { ok: false as const, error: "no_profile" };
  if (profile.referredBySessionId) return { ok: false as const, error: "already_referred" };

  const referrer = await prisma.userProfile.findFirst({
    where: { referralCode: normalized },
  });
  if (!referrer || referrer.sessionId === sessionId) {
    return { ok: false as const, error: "invalid_code" };
  }

  await prisma.userProfile.update({
    where: { sessionId },
    data: { referredBySessionId: referrer.sessionId },
  });

  const referralCount = await prisma.userProfile.count({
    where: { referredBySessionId: referrer.sessionId },
  });

  if (referralCount === 3) {
    await grantUserCosmetic(referrer.sessionId, {
      type: "frame",
      key: "summer-sale",
      source: "referral",
    }).catch(() => {});
  }

  return { ok: true as const, referrerName: referrer.steamPersona || referrer.name || "Friend" };
}

export async function getReferralStats(sessionId: string) {
  const [profile, count] = await Promise.all([
    prisma.userProfile.findUnique({ where: { sessionId } }),
    prisma.userProfile.count({ where: { referredBySessionId: sessionId } }),
  ]);

  const code = profile?.referralCode ?? (await ensureReferralCode(sessionId));

  return {
    code,
    count,
    referred: Boolean(profile?.referredBySessionId),
  };
}
