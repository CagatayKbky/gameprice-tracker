import { prisma } from "@/lib/db";
import { downgradeToFree, setProPlan } from "@/lib/premium/access";
import { grantDefaultProfileCosmetics } from "@/lib/services/profile-cosmetics";

export type UserIdentifierType = "sessionId" | "steamId" | "email";

export async function findUserProfile(identifier: string, type: UserIdentifierType) {
  const value = identifier.trim();
  if (!value) return null;

  if (type === "sessionId") {
    return prisma.userProfile.findUnique({ where: { sessionId: value } });
  }
  if (type === "steamId") {
    return prisma.userProfile.findFirst({ where: { steamId: value } });
  }
  return prisma.userProfile.findFirst({
    where: { email: { equals: value, mode: "insensitive" } },
  });
}

export async function searchUserProfiles(query: string, limit = 12) {
  const q = query.trim();
  if (!q) return [];

  return prisma.userProfile.findMany({
    where: {
      OR: [
        { sessionId: { contains: q, mode: "insensitive" } },
        { steamId: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { steamPersona: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      sessionId: true,
      email: true,
      name: true,
      steamId: true,
      steamPersona: true,
      steamAvatar: true,
      isAdmin: true,
      plan: true,
      planExpiresAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function setUserAdmin(sessionId: string, isAdmin: boolean) {
  return prisma.userProfile.upsert({
    where: { sessionId },
    create: { sessionId, isAdmin },
    update: { isAdmin, updatedAt: new Date() },
  });
}

export async function setUserPro(sessionId: string, enabled: boolean) {
  if (enabled) {
    const profile = await setProPlan(sessionId, {
      plan: "pro",
      planExpiresAt: null,
    });
    const libraryCount = await prisma.steamOwnedGame.count({ where: { sessionId } });
    await grantDefaultProfileCosmetics(sessionId, {
      isPro: true,
      isAdmin: profile.isAdmin,
      steamConnected: Boolean(profile.steamId),
      libraryCount,
    });
    return profile;
  }

  return downgradeToFree(sessionId);
}

export async function setUserAccess(
  identifier: string,
  type: UserIdentifierType,
  access: { isAdmin?: boolean; isPro?: boolean }
) {
  const profile = await findUserProfile(identifier, type);
  if (!profile) {
    throw new Error("user_not_found");
  }

  let updated = profile;
  if (access.isAdmin !== undefined) {
    updated = await setUserAdmin(profile.sessionId, access.isAdmin);
  }
  if (access.isPro !== undefined) {
    updated = await setUserPro(profile.sessionId, access.isPro);
  }

  return updated;
}
