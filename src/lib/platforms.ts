import { Platform } from "@/types";

export const PLATFORMS: Platform[] = [
  // PC Stores
  {
    id: "steam",
    name: "Steam",
    shortName: "Steam",
    category: "pc",
    color: "#1b2838",
    icon: "steam",
    cheapSharkId: 1,
    enabled: true,
  },
  {
    id: "epic",
    name: "Epic Games Store",
    shortName: "Epic",
    category: "pc",
    color: "#2f2f2f",
    icon: "epic",
    cheapSharkId: 25,
    enabled: true,
  },
  {
    id: "gog",
    name: "GOG",
    shortName: "GOG",
    category: "pc",
    color: "#86328a",
    icon: "gog",
    cheapSharkId: 7,
    enabled: true,
  },
  {
    id: "ea",
    name: "EA App",
    shortName: "EA",
    category: "pc",
    color: "#ff4747",
    icon: "ea",
    cheapSharkId: 8,
    enabled: true,
  },
  {
    id: "ubisoft",
    name: "Ubisoft Connect",
    shortName: "Ubisoft",
    category: "pc",
    color: "#0070ff",
    icon: "ubisoft",
    cheapSharkId: 13,
    enabled: true,
  },
  {
    id: "battlenet",
    name: "Battle.net",
    shortName: "Battle.net",
    category: "pc",
    color: "#00aeff",
    icon: "battlenet",
    cheapSharkId: 14,
    enabled: true,
  },
  {
    id: "humble",
    name: "Humble Store",
    shortName: "Humble",
    category: "pc",
    color: "#cc5533",
    icon: "humble",
    cheapSharkId: 11,
    enabled: true,
  },
  {
    id: "greenmangaming",
    name: "Green Man Gaming",
    shortName: "GMG",
    category: "pc",
    color: "#0d9d4d",
    icon: "gmg",
    cheapSharkId: 3,
    enabled: true,
  },
  {
    id: "gamersgate",
    name: "GamersGate",
    shortName: "GG",
    category: "pc",
    color: "#e85d04",
    icon: "gamersgate",
    cheapSharkId: 2,
    enabled: true,
  },
  // PlayStation
  {
    id: "ps5",
    name: "PlayStation Store (PS5)",
    shortName: "PS5",
    category: "console",
    color: "#003791",
    icon: "playstation",
    region: "TR",
    enabled: true,
  },
  {
    id: "ps4",
    name: "PlayStation Store (PS4)",
    shortName: "PS4",
    category: "console",
    color: "#003087",
    icon: "playstation",
    region: "TR",
    enabled: true,
  },
  // Xbox
  {
    id: "xbox-series",
    name: "Xbox Store (Series X|S)",
    shortName: "Xbox Series",
    category: "console",
    color: "#107c10",
    icon: "xbox",
    region: "TR",
    enabled: true,
  },
  {
    id: "xbox-one",
    name: "Xbox Store (One)",
    shortName: "Xbox One",
    category: "console",
    color: "#0e6b0e",
    icon: "xbox",
    region: "TR",
    enabled: true,
  },
  // Nintendo
  {
    id: "switch",
    name: "Nintendo eShop",
    shortName: "Switch",
    category: "console",
    color: "#e60012",
    icon: "nintendo",
    region: "TR",
    enabled: true,
  },
  // Subscriptions
  {
    id: "gamepass",
    name: "Xbox Game Pass",
    shortName: "Game Pass",
    category: "subscription",
    color: "#107c10",
    icon: "gamepass",
    enabled: true,
  },
  {
    id: "psplus",
    name: "PlayStation Plus",
    shortName: "PS Plus",
    category: "subscription",
    color: "#003791",
    icon: "psplus",
    enabled: true,
  },
];

export const PLATFORM_MAP = new Map(PLATFORMS.map((p) => [p.id, p]));

export const CHEAPSHARK_PLATFORM_MAP = new Map(
  PLATFORMS.filter((p) => p.cheapSharkId).map((p) => [p.cheapSharkId!, p])
);

export function getPlatformById(id: string): Platform | undefined {
  return PLATFORM_MAP.get(id);
}

export function getPlatformByCheapSharkId(id: number): Platform | undefined {
  return CHEAPSHARK_PLATFORM_MAP.get(id);
}

export function getPlatformsByCategory(category: Platform["category"]): Platform[] {
  return PLATFORMS.filter((p) => p.category === category);
}
