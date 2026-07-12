import { prisma } from "@/lib/db";
import { refreshGogToken } from "@/lib/auth/gog";
import { importManualGames } from "@/lib/services/manual-library";
import { resolveGogProductTitles } from "@/lib/services/library-import-parser";

async function getGogAccessToken(sessionId: string): Promise<string | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { sessionId },
    select: { gogRefreshToken: true },
  });
  if (!profile?.gogRefreshToken) return null;

  try {
    const tokens = await refreshGogToken(profile.gogRefreshToken);
    if (tokens.refresh_token) {
      await prisma.userProfile.update({
        where: { sessionId },
        data: { gogRefreshToken: tokens.refresh_token },
      });
    }
    return tokens.access_token;
  } catch {
    return null;
  }
}

export async function syncGogLibrary(sessionId: string) {
  const accessToken = await getGogAccessToken(sessionId);
  if (!accessToken) throw new Error("gog_not_connected");

  const res = await fetch("https://embed.gog.com/user/data/games", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "GamePrice/1.0",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error("gog_library_fetch_failed");

  const data = (await res.json()) as { owned?: number[] };
  const ids = Array.isArray(data.owned) ? data.owned : [];
  const titles = await resolveGogProductTitles(ids);

  const result = await importManualGames(sessionId, "gog", titles);

  await prisma.userProfile.update({
    where: { sessionId },
    data: { gogLibrarySyncedAt: new Date() },
  });

  return { ...result, total: titles.length };
}

export async function syncAllGogLibraries() {
  const users = await prisma.userProfile.findMany({
    where: { gogRefreshToken: { not: null } },
    select: { sessionId: true },
  });

  let synced = 0;
  let errors = 0;

  for (const user of users) {
    try {
      await syncGogLibrary(user.sessionId);
      synced++;
    } catch {
      errors++;
    }
  }

  return { users: users.length, synced, errors };
}
