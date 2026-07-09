"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  Bell,
  Clock,
  Settings,
  Loader2,
  Mail,
  Crown,
  ExternalLink,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useRecentlyViewed } from "@/components/providers/RecentlyViewedProvider";
import { SteamLoginButton } from "@/components/auth/SteamLoginButton";
import { SteamWishlistSync } from "@/components/profile/SteamWishlistSync";
import { ProfileLibrarySection } from "@/components/profile/ProfileLibrarySection";
import { LibraryInsightsPanel } from "@/components/profile/LibraryInsightsPanel";
import { ProfileCosmeticsPanel } from "@/components/profile/ProfileCosmeticsPanel";
import { BuyWaitPanel } from "@/components/profile/BuyWaitPanel";
import { SteamProfileHeader } from "@/components/profile/SteamProfileHeader";

interface ProfileData {
  email: string | null;
  name: string | null;
  isAdmin?: boolean;
  publicProfile?: boolean;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  pushNotifications: boolean;
  steamId: string | null;
  steamPersona: string | null;
  steamAvatar: string | null;
  isPro?: boolean;
  plan?: string;
  limits?: { wishlist: number };
  usage?: { wishlist: number };
  activeProfileFrame?: string;
  activeProfileEffect?: string;
}

interface SteamData {
  connected: boolean;
  steam?: {
    steamId: string;
    steamPersona: string | null;
    steamAvatar: string | null;
    profileUrl: string;
    memberSince?: string | null;
    location?: string | null;
    onlineState?: string | null;
  };
  wishlist?: {
    count: number;
    items: Array<{
      name: string;
      appId?: string;
      gameId?: string;
      imageUrl?: string;
    }>;
  };
}

interface CosmeticsData {
  appearance: {
    frameId: string;
    effectId: string;
  };
  equipped: {
    frame: string;
    effect: string;
  };
  cosmetics: {
    frames: Array<{
      id: string;
      label: string;
      description: string;
      unlocked: boolean;
      proOnly?: boolean;
    }>;
    effects: Array<{
      id: string;
      label: string;
      description: string;
      unlocked: boolean;
      proOnly?: boolean;
    }>;
    badges: Array<{
      id: string;
      label: string;
      toneClass: string;
    }>;
    badgeCatalog?: {
      statusBadges: Array<{
        id: string;
        label: string;
        toneClass: string;
        description: string;
        unlockHint: string;
        unlocked: boolean;
        kind: "status" | "cosmetic";
      }>;
      cosmeticBadges: Array<{
        id: string;
        label: string;
        toneClass: string;
        description: string;
        unlockHint: string;
        unlocked: boolean;
        kind: "status" | "cosmetic";
      }>;
    };
  };
}

function onlineLabel(state: string | null | undefined, t: (k: string) => string) {
  if (!state) return null;
  if (state === "online") return t("profile.steamOnline");
  if (state === "in-game") return t("profile.steamInGame");
  if (state === "offline") return t("profile.steamOffline");
  return state;
}

function ProfileContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const { games: recentlyViewed } = useRecentlyViewed();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [steamData, setSteamData] = useState<SteamData | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [cosmetics, setCosmetics] = useState<CosmeticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [steamBanner, setSteamBanner] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const loadData = useCallback(async () => {
    const [prof, wishlist, alerts, steam, cosmeticsData] = await Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/wishlist").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
      fetch("/api/steam/profile").then((r) => r.json()),
      fetch("/api/profile/cosmetics").then((r) => r.json()),
    ]);
    setProfile(prof);
    setSteamData(steam);
    setCosmetics(cosmeticsData);
    setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
    setAlertCount(
      Array.isArray(alerts)
        ? alerts.filter((a: { isActive: boolean }) => a.isActive).length
        : 0
    );
  }, []);

  useEffect(() => {
    loadData()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    if (searchParams.get("steam") === "ok") {
      setSteamBanner(t("profile.steamConnected"));
      const url = new URL(window.location.href);
      url.searchParams.delete("steam");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams, t]);

  const handleDisconnect = async () => {
    if (!confirm(t("profile.steamDisconnectConfirm"))) return;
    setDisconnecting(true);
    try {
      await fetch("/api/auth/steam/disconnect", { method: "POST" });
      await loadData();
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  const steam = steamData?.steam;
  const displayName =
    steam?.steamPersona ||
    profile?.name ||
    (profile?.email ? profile.email.split("@")[0] : t("profile.guestName"));
  const avatarUrl = steam?.steamAvatar || profile?.steamAvatar;
  const isSteamConnected = Boolean(profile?.steamId || steam?.steamId);
  const steamId = profile?.steamId || steam?.steamId || "";
  const badges = cosmetics?.cosmetics.badgeCatalog
    ? [
        ...cosmetics.cosmetics.badgeCatalog.statusBadges.filter((b) => b.unlocked),
        ...cosmetics.cosmetics.badgeCatalog.cosmeticBadges.filter((b) => b.unlocked),
      ].map((badge) => ({
        id: badge.id,
        label: badge.label,
        cls: badge.toneClass,
      }))
    : [
        profile?.isAdmin ? { id: "admin", label: "Admin", cls: "bg-red-500/15 text-red-300 border-red-500/30" } : null,
        profile?.isPro ? { id: "pro", label: "Pro", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" } : null,
        isSteamConnected ? { id: "steam", label: "Steam", cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" } : null,
        ...(cosmetics?.cosmetics.badges || []).map((badge) => ({
          id: badge.id,
          label: badge.label,
          cls: badge.toneClass,
        })),
      ].filter(Boolean) as Array<{ id: string; label: string; cls: string }>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {steamBanner && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {steamBanner}
        </div>
      )}

      <SteamProfileHeader
        displayName={displayName}
        avatarUrl={avatarUrl}
        frameId={cosmetics?.equipped.frame || cosmetics?.appearance.frameId}
        effectId={cosmetics?.equipped.effect || cosmetics?.appearance.effectId}
        badges={badges}
        showSteamBadge={isSteamConnected}
        subtitle={
          profile?.isPro ? (
            <span className="mt-1 inline-flex items-center gap-1 text-sm text-amber-300">
              <Crown className="h-3.5 w-3.5" />
              Pro Member
            </span>
          ) : (
            <Link href="/pricing" className="mt-1 inline-block text-sm text-[#66c0f4] hover:underline">
              Free plan
            </Link>
          )
        }
        meta={
          <>
            {profile?.email && (
              <p className="mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {profile.email}
              </p>
            )}
            {isSteamConnected && steam && (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {steam.memberSince && (
                  <span>{t("profile.steamMemberSince", { date: steam.memberSince })}</span>
                )}
                {steam.location && <span>{steam.location}</span>}
                {onlineLabel(steam.onlineState, t) && (
                  <span className="text-emerald-400">{onlineLabel(steam.onlineState, t)}</span>
                )}
              </div>
            )}
          </>
        }
        actions={
          <>
            {isSteamConnected && steam?.profileUrl && (
              <a
                href={steam.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2a475e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3d6b8c]"
              >
                {t("profile.steamProfile")}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-[#66c0f4]/30 bg-[#1b2838] px-4 py-2 text-sm font-medium text-[#66c0f4] transition-colors hover:bg-[#2a475e]"
            >
              <Settings className="h-4 w-4" />
              {t("profile.edit")}
            </Link>
            {isSteamConnected && (
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-4 py-2 text-sm text-red-300 transition-colors hover:border-red-400/40 disabled:opacity-50"
              >
                {disconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {t("profile.steamDisconnect")}
              </button>
            )}
          </>
        }
      />

      {!isSteamConnected && (
        <div className="rounded-2xl border border-dashed border-[#66c0f4]/30 bg-steam/10 p-6 mb-8 text-center">
          <Sparkles className="w-8 h-8 text-[#66c0f4] mx-auto mb-3" />
          <h2 className="font-semibold text-lg mb-1">{t("profile.steamConnectTitle")}</h2>
          <p className="text-sm text-muted mb-4 max-w-md mx-auto">{t("profile.steamConnectDesc")}</p>
          <SteamLoginButton />
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/wishlist"
          className="group rounded-xl border border-[#2a475e]/60 bg-[#1b2838] p-5 transition-colors hover:border-pink-400/30"
        >
          <Heart className="mb-2 h-5 w-5 text-pink-400 transition-transform group-hover:scale-110" />
          <p className="text-2xl font-bold text-white">{wishlistCount}</p>
          <p className="text-sm text-[#8f98a0]">{t("profile.wishlist")}</p>
          {profile?.limits && profile.usage && profile.limits.wishlist !== Infinity && (
            <p className="mt-1 text-xs text-[#8f98a0]">
              {profile.usage.wishlist}/{profile.limits.wishlist}
            </p>
          )}
        </Link>
        <Link
          href="/alerts"
          className="group rounded-xl border border-[#2a475e]/60 bg-[#1b2838] p-5 transition-colors hover:border-[#66c0f4]/30"
        >
          <Bell className="mb-2 h-5 w-5 text-[#66c0f4] transition-transform group-hover:scale-110" />
          <p className="text-2xl font-bold text-white">{alertCount}</p>
          <p className="text-sm text-[#8f98a0]">{t("profile.alerts")}</p>
        </Link>
        <div className="rounded-xl border border-[#2a475e]/60 bg-[#1b2838] p-5">
          <Clock className="mb-2 h-5 w-5 text-[#8f98a0]" />
          <p className="text-2xl font-bold text-white">{recentlyViewed.length}</p>
          <p className="text-sm text-[#8f98a0]">{t("profile.viewed")}</p>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-[#2a475e]/50 bg-[#0e1419] p-5">
        <h2 className="mb-1 font-semibold text-white">{t("buyWait.title")}</h2>
        <p className="mb-4 text-sm text-[#8f98a0]">{t("buyWait.subtitle")}</p>
        <BuyWaitPanel compact />
      </section>

      {cosmetics && (
        <ProfileCosmeticsPanel
          frames={cosmetics.cosmetics.frames}
          effects={cosmetics.cosmetics.effects}
          badgeCatalog={cosmetics.cosmetics.badgeCatalog}
          equipped={cosmetics.equipped}
          isPro={Boolean(profile?.isPro)}
          avatarUrl={avatarUrl}
          displayName={displayName}
          onUpdated={loadData}
        />
      )}

      {isSteamConnected && steamId && (
        <div className="mb-8">
          <SteamWishlistSync
            steamId={steamId}
            steamWishlistCount={steamData?.wishlist?.count}
            onImported={loadData}
          />
        </div>
      )}

      <ProfileLibrarySection steamConnected={isSteamConnected} />
      <LibraryInsightsPanel steamConnected={isSteamConnected} />

      {steamData?.wishlist && steamData.wishlist.items.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">{t("profile.steamWishlistPreview")}</h2>
            <span className="text-sm text-muted">
              {t("profile.steamWishlistCount", { count: String(steamData.wishlist.count) })}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {steamData.wishlist.items.map((item) => (
              <Link
                key={item.appId || item.name}
                href={item.gameId ? `/game/${item.gameId}` : "#"}
                className="group rounded-xl overflow-hidden border border-border bg-card hover:border-accent/30 transition-colors"
              >
                {item.imageUrl && (
                  <div className="relative aspect-460/215 bg-background">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 50vw, 200px"
                    />
                  </div>
                )}
                <p className="p-2.5 text-xs font-medium line-clamp-2">{item.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg mb-4">{t("profile.viewed")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentlyViewed.slice(0, 8).map((game) => (
              <Link
                key={game.gameId}
                href={`/game/${game.gameId}`}
                className="group rounded-xl overflow-hidden border border-border bg-card hover:border-accent/30 transition-colors"
              >
                {game.imageUrl && (
                  <div className="relative aspect-3/4 bg-background">
                    <Image
                      src={game.imageUrl}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="120px"
                    />
                  </div>
                )}
                <p className="p-2 text-xs font-medium line-clamp-2">{game.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!profile?.email && !isSteamConnected && (
        <p className="text-center text-sm text-muted mt-8">{t("profile.empty")}</p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
