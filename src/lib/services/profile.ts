import { prisma } from "@/lib/db";

export interface UserProfileData {
  email?: string | null;
  name?: string | null;
  isAdmin?: boolean;
  publicProfile?: boolean;
  emailNotifications: boolean;
  weeklyDigest?: boolean;
  pushNotifications?: boolean;
  wishlistDealAlerts?: boolean;
  discordWebhook?: string | null;
  telegramChatId?: string | null;
  steamId?: string | null;
  steamPersona?: string | null;
  steamAvatar?: string | null;
  onboardingDone?: boolean;
  freeGameNotify?: boolean;
  hideOwnedGames?: boolean;
  steamLibrarySyncedAt?: Date | null;
  activeProfileFrame?: string;
  activeProfileEffect?: string;
  profileSlug?: string | null;
}

export async function getProfile(sessionId: string): Promise<UserProfileData | null> {
  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile) return null;
  return {
    email: profile.email,
    name: profile.name,
    isAdmin: profile.isAdmin,
    publicProfile: profile.publicProfile,
    emailNotifications: profile.emailNotifications,
    weeklyDigest: profile.weeklyDigest,
    pushNotifications: profile.pushNotifications,
    wishlistDealAlerts: profile.wishlistDealAlerts,
    discordWebhook: profile.discordWebhook,
    telegramChatId: profile.telegramChatId,
    steamId: profile.steamId,
    steamPersona: profile.steamPersona,
    steamAvatar: profile.steamAvatar,
    onboardingDone: profile.onboardingDone,
    freeGameNotify: profile.freeGameNotify,
    hideOwnedGames: profile.hideOwnedGames,
    steamLibrarySyncedAt: profile.steamLibrarySyncedAt,
    activeProfileFrame: profile.activeProfileFrame,
    activeProfileEffect: profile.activeProfileEffect,
    profileSlug: profile.profileSlug,
  };
}

export async function upsertProfile(sessionId: string, data: Partial<UserProfileData>) {
  return prisma.userProfile.upsert({
    where: { sessionId },
    create: {
      sessionId,
      email: data.email ?? null,
      name: data.name ?? null,
      isAdmin: data.isAdmin ?? false,
      publicProfile: data.publicProfile ?? true,
      emailNotifications: data.emailNotifications ?? true,
      weeklyDigest: data.weeklyDigest ?? true,
      pushNotifications: data.pushNotifications ?? true,
      wishlistDealAlerts: data.wishlistDealAlerts ?? true,
      discordWebhook: data.discordWebhook ?? null,
      telegramChatId: data.telegramChatId ?? null,
      activeProfileFrame: data.activeProfileFrame ?? "classic",
      activeProfileEffect: data.activeProfileEffect ?? "none",
    },
    update: {
      ...(data.email !== undefined ? { email: data.email || null } : {}),
      ...(data.name !== undefined ? { name: data.name || null } : {}),
      ...(data.isAdmin !== undefined ? { isAdmin: data.isAdmin } : {}),
      ...(data.publicProfile !== undefined ? { publicProfile: data.publicProfile } : {}),
      ...(data.emailNotifications !== undefined
        ? { emailNotifications: data.emailNotifications }
        : {}),
      ...(data.weeklyDigest !== undefined ? { weeklyDigest: data.weeklyDigest } : {}),
      ...(data.pushNotifications !== undefined
        ? { pushNotifications: data.pushNotifications }
        : {}),
      ...(data.wishlistDealAlerts !== undefined
        ? { wishlistDealAlerts: data.wishlistDealAlerts }
        : {}),
      ...(data.discordWebhook !== undefined
        ? { discordWebhook: data.discordWebhook || null }
        : {}),
      ...(data.telegramChatId !== undefined
        ? { telegramChatId: data.telegramChatId || null }
        : {}),
      ...(data.onboardingDone !== undefined ? { onboardingDone: data.onboardingDone } : {}),
      ...(data.freeGameNotify !== undefined ? { freeGameNotify: data.freeGameNotify } : {}),
      ...(data.hideOwnedGames !== undefined ? { hideOwnedGames: data.hideOwnedGames } : {}),
      ...(data.activeProfileFrame !== undefined
        ? { activeProfileFrame: data.activeProfileFrame || "classic" }
        : {}),
      ...(data.activeProfileEffect !== undefined
        ? { activeProfileEffect: data.activeProfileEffect || "none" }
        : {}),
      updatedAt: new Date(),
    },
  });
}

export async function getProfileEmail(sessionId: string): Promise<string | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { sessionId },
    select: { email: true, emailNotifications: true },
  });
  if (!profile?.email || !profile.emailNotifications) return null;
  return profile.email;
}
