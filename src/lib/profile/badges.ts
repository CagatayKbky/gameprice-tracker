import { SPECIAL_BADGES, getBadgeDefinition } from "@/lib/profile/cosmetics";

export const EARLY_SUPPORTER_CUTOFF = new Date("2026-06-01T00:00:00.000Z");

export interface StatusBadge {
  id: string;
  label: string;
  toneClass: string;
  description: string;
  unlockHint: string;
  unlocked: boolean;
  kind: "status" | "cosmetic";
}

const STATUS_BADGES = [
  {
    id: "pro",
    label: "Pro",
    toneClass: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    description: "Aktif Pro üyelik rozeti.",
    unlockHint: "Pro plana abone ol.",
  },
  {
    id: "admin",
    label: "Admin",
    toneClass: "bg-red-500/15 text-red-300 border border-red-500/30",
    description: "Site yöneticisi rozeti.",
    unlockHint: "Yalnızca yöneticilere verilir.",
  },
  {
    id: "steam",
    label: "Steam",
    toneClass: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
    description: "Steam hesabı bağlı.",
    unlockHint: "Profilden Steam hesabını bağla.",
  },
] as const;

export function computeAutoBadgeUnlocks(params: {
  isPro: boolean;
  isAdmin?: boolean;
  steamConnected?: boolean;
  libraryCount?: number;
  wishlistCount?: number;
  createdAt?: Date | null;
}) {
  const badges: string[] = [];

  if (params.isPro && params.steamConnected) badges.push("steam-pro");
  if ((params.libraryCount || 0) >= 100) badges.push("verified-collector");
  if ((params.wishlistCount || 0) >= 10) badges.push("deal-hunter");
  if (params.isAdmin) badges.push("founder");
  if (params.createdAt && params.createdAt < EARLY_SUPPORTER_CUTOFF) {
    badges.push("early-supporter");
  }

  return badges;
}

export function buildProfileBadgeViews(params: {
  isPro: boolean;
  isAdmin?: boolean;
  steamConnected?: boolean;
  unlockedCosmeticBadgeIds: string[];
}) {
  const statusBadges: StatusBadge[] = STATUS_BADGES.map((badge) => {
    const unlocked =
      badge.id === "pro"
        ? params.isPro
        : badge.id === "admin"
          ? Boolean(params.isAdmin)
          : badge.id === "steam"
            ? Boolean(params.steamConnected)
            : false;

    return {
      ...badge,
      unlocked,
      kind: "status" as const,
    };
  });

  const cosmeticBadges: StatusBadge[] = SPECIAL_BADGES.map((badge) => ({
    id: badge.id,
    label: badge.label,
    toneClass: badge.toneClass,
    description: badge.description,
    unlockHint: badge.unlockHint,
    unlocked: params.unlockedCosmeticBadgeIds.includes(badge.id),
    kind: "cosmetic" as const,
  }));

  return { statusBadges, cosmeticBadges };
}

export function buildDisplayedBadges(params: {
  isPro: boolean;
  isAdmin?: boolean;
  steamConnected?: boolean;
  unlockedCosmeticBadgeIds: string[];
}) {
  const { statusBadges, cosmeticBadges } = buildProfileBadgeViews(params);

  const displayed = [
    ...statusBadges.filter((b) => b.unlocked),
    ...cosmeticBadges.filter((b) => b.unlocked),
  ].map((badge) => ({
    id: badge.id,
    label: badge.label,
    cls: badge.toneClass,
  }));

  return displayed;
}

export function getBadgeCatalogItem(id: string) {
  const cosmetic = getBadgeDefinition(id);
  if (cosmetic) return cosmetic;
  const status = STATUS_BADGES.find((badge) => badge.id === id);
  return status
    ? {
        id: status.id,
        label: status.label,
        description: status.description,
        unlockHint: status.unlockHint,
        toneClass: status.toneClass,
      }
    : null;
}
