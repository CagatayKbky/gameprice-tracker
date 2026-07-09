import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { DEAL_CATEGORIES } from "@/lib/deal-categories";
import { GAMES_PER_SITEMAP, PUBLIC_STATIC_ROUTES, SITE_URL } from "@/lib/seo/constants";

export async function generateSitemaps() {
  try {
    const total = await prisma.catalogGame.count({
      where: { cheapSharkId: { not: null } },
    });
    const gamePages = Math.max(1, Math.ceil(total / GAMES_PER_SITEMAP));
    return Array.from({ length: gamePages }, (_, id) => ({ id }));
  } catch {
    return [{ id: 0 }];
  }
}

function staticSitemapEntries(): MetadataRoute.Sitemap {
  const categoryRoutes = DEAL_CATEGORIES.map((c) => ({
    path: `/deals/category/${c.slug}`,
    priority: 0.85,
    changeFrequency: "daily" as const,
  }));

  return [...PUBLIC_STATIC_ROUTES, ...categoryRoutes].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const pageId = Number(id) || 0;

  try {
    const games = await prisma.catalogGame.findMany({
      where: { cheapSharkId: { not: null } },
      orderBy: { updatedAt: "desc" },
      skip: pageId * GAMES_PER_SITEMAP,
      take: GAMES_PER_SITEMAP,
      select: { cheapSharkId: true, slug: true, updatedAt: true },
    });

    const gameRoutes: MetadataRoute.Sitemap = games.map((g) => ({
      url: `${SITE_URL}/game/${g.cheapSharkId || g.slug}`,
      lastModified: g.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    }));

    if (pageId === 0) {
      return [...staticSitemapEntries(), ...gameRoutes];
    }

    return gameRoutes;
  } catch {
    return pageId === 0 ? staticSitemapEntries() : [];
  }
}
