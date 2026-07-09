import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { DEAL_CATEGORIES } from "@/lib/deal-categories";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/browse",
    "/search",
    "/deals",
    "/compare",
    "/platforms",
    "/wishlist",
    "/alerts",
    "/settings",
    "/profile",
    "/bundles",
    "/about",
    "/guides/sale-calendar",
    "/admin",
  ];

  const categoryRoutes = DEAL_CATEGORIES.map((c) => `/deals/category/${c.slug}`);

  let gameRoutes: MetadataRoute.Sitemap = [];
  try {
    const games = await prisma.catalogGame.findMany({
      where: { cheapSharkId: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: 5000,
      select: { cheapSharkId: true, slug: true, updatedAt: true },
    });

    gameRoutes = games.map((g) => ({
      url: `${baseUrl}/game/${g.cheapSharkId || g.slug}`,
      lastModified: g.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable during build
  }

  const pages = [...staticRoutes, ...categoryRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" || route === "/deals" ? "hourly" : "daily") as
      | "hourly"
      | "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  return [...pages, ...gameRoutes];
}
