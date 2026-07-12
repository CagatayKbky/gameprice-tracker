export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://gameprice.org";

export const SITE_NAME = "GamePrice";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export const GAMES_PER_SITEMAP = 10_000;

import { GUIDE_CATALOG } from "@/lib/guides/catalog";

export const PUBLIC_STATIC_ROUTES = [
  { path: "", priority: 1, changeFrequency: "hourly" as const },
  { path: "/deals", priority: 0.95, changeFrequency: "hourly" as const },
  { path: "/browse", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/search", priority: 0.85, changeFrequency: "daily" as const },
  { path: "/compare", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "/platforms", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/bundles", priority: 0.75, changeFrequency: "daily" as const },
  { path: "/pricing", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/guides", priority: 0.85, changeFrequency: "weekly" as const },
  ...GUIDE_CATALOG.map((guide) => ({
    path: `/guides/${guide.slug}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  })),
];

export const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/api/",
  "/profile",
  "/settings",
  "/wishlist",
  "/alerts",
  "/notifications",
  "/social",
  "/pricing/checkout",
];
