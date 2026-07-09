import { prisma } from "@/lib/db";
import { getPublicProfilePath, isSteamId64, toProfileSlug } from "@/lib/profile/profile-slug";

export async function resolveUniqueProfileSlug(
  persona: string,
  sessionId: string
): Promise<string | null> {
  const base = toProfileSlug(persona);
  if (!base) return null;

  let candidate = base;
  let suffix = 2;
  while (true) {
    const existing = await prisma.userProfile.findFirst({
      where: { profileSlug: candidate, NOT: { sessionId } },
      select: { sessionId: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function syncProfileSlug(sessionId: string, persona: string | null) {
  const profileSlug = persona ? await resolveUniqueProfileSlug(persona, sessionId) : null;
  return prisma.userProfile.update({
    where: { sessionId },
    data: { profileSlug },
  });
}

export async function findPublicProfileBySlug(slug: string) {
  if (isSteamId64(slug)) {
    return prisma.userProfile.findFirst({
      where: { steamId: slug, publicProfile: true },
    });
  }

  const normalized = slug.toLowerCase();
  const byStoredSlug = await prisma.userProfile.findFirst({
    where: { profileSlug: normalized, publicProfile: true },
  });
  if (byStoredSlug) return byStoredSlug;

  const candidates = await prisma.userProfile.findMany({
    where: {
      publicProfile: true,
      steamPersona: { not: null },
      OR: [{ profileSlug: null }, { profileSlug: normalized }],
    },
    select: {
      sessionId: true,
      steamId: true,
      steamPersona: true,
      profileSlug: true,
    },
    take: 50,
  });

  return (
    candidates.find((profile) => toProfileSlug(profile.steamPersona) === normalized) || null
  );
}

export function publicProfileHref(profile: {
  steamId?: string | null;
  profileSlug?: string | null;
  steamPersona?: string | null;
}) {
  return getPublicProfilePath(profile);
}
