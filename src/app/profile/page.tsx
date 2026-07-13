"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GameImage } from "@/components/ui/GameImage";
import { resolveGameImage } from "@/lib/game-images";
import { extractSteamAppId } from "@/lib/game-id";
import { fetchJson } from "@/lib/fetch-json";
import {
  Heart,
  Bell,
  Clock,
  Settings,
  Loader2,
  Mail,
  Crown,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useRecentlyViewed } from "@/components/providers/RecentlyViewedProvider";
import { getPublicProfilePath } from "@/lib/profile/profile-slug";
import { SteamWishlistImport } from "@/components/games/SteamWishlistImport";
import { ProfileLibrarySection } from "@/components/profile/ProfileLibrarySection";
import { LibraryInsightsPanel } from "@/components/profile/LibraryInsightsPanel";
import { ProfileCosmeticsPanel } from "@/components/profile/ProfileCosmeticsPanel";
import { BuyWaitPanel } from "@/components/profile/BuyWaitPanel";
import { SteamProfileHeader } from "@/components/profile/SteamProfileHeader";
import { ShareProfileButton } from "@/components/profile/ShareProfileButton";
import { ProfilePageSkeleton } from "@/components/ui/PageLoading";

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
  googleId?: string | null;
  googleAvatar?: string | null;
  isPro?: boolean;
  plan?: string;
  limits?: { wishlist: number };
  usage?: { wishlist: number };
  profileSlug?: string | null;
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
  const { games: recentlyViewed } = useRecentlyViewed();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [steamData, setSteamData] = useState<SteamData | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [cosmetics, setCosmetics] = useState<CosmeticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [steamBanner, setSteamBanner] = useState<string | null>(null);

  const loadExtras = useCallback(async () => {
    try {
      const [steam, cosmeticsData] = await Promise.all([
        fetchJson<SteamData>("/api/steam/profile?wishlist=0", 10_000).catch(() => ({
          connected: false,
        })),
        fetchJson<CosmeticsData>("/api/profile/cosmetics", 10_000).catch(() => null),
      ]);
      setSteamData(steam);
      if (cosmeticsData) setCosmetics(cosmeticsData);
    } catch {
      /* ignore */
    }
  }, []);

  const loadData = useCallback(async () => {
    const [prof, wishlist, alerts] = await Promise.all([
      fetchJson<ProfileData>("/api/profile?light=1", 10_000).catch(() => null),
      fetchJson<unknown[]>("/api/wishlist", 10_000).catch(() => []),
      fetchJson<Array<{ isActive: boolean }>>("/api/alerts", 10_000).catch(() => []),
    ]);
    if (prof) setProfile(prof);
    setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
    setAlertCount(
      Array.isArray(alerts)
        ? alerts.filter((a) => a.isActive).length
        : 0
    );
  }, []);

  const reloadAll = useCallback(async () => {
    await loadData();
    await loadExtras();
  }, [loadData, loadExtras]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadData();
      } finally {
        if (!cancelled) setLoading(false);
      }
      if (!cancelled) void loadExtras();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadData, loadExtras]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("steam") === "ok" ? "steam" : params.get("google") === "ok" ? "google" : null;
    if (auth) {
      setSteamBanner(auth === "steam" ? t("profile.steamConnected") : t("profile.googleConnected"));
      const url = new URL(window.location.href);
      url.searchParams.delete(auth === "steam" ? "steam" : "google");
      window.history.replaceState({}, "", url.pathname);
      if (auth === "google") {
        void loadData().then(() => loadExtras());
      }
    }
  }, [t, loadData, loadExtras]);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  const steam = steamData?.steam;
  const displayName =
    steam?.steamPersona ||
    profile?.name ||
    (profile?.email ? profile.email.split("@")[0] : t("profile.guestName"));
  const avatarUrl = steam?.steamAvatar || profile?.steamAvatar || profile?.googleAvatar;
  const isSteamConnected = Boolean(profile?.steamId || steam?.steamId);
  const isGoogleConnected = Boolean(profile?.googleId);
  const steamId = profile?.steamId || steam?.steamId || "";
  const publicPath = getPublicProfilePath({
    steamId: profile?.steamId,
    profileSlug: profile?.profileSlug,
    steamPersona: profile?.steamPersona || steam?.steamPersona,
    name: profile?.name,
  });
  const shareSlug = publicPath?.replace("/u/", "") || "";
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
        isGoogleConnected ? { id: "google", label: "Google", cls: "bg-white/10 text-white border-white/20" } : null,
        ...(cosmetics?.cosmetics.badges || []).map((badge) => ({
          id: badge.id,
          label: badge.label,
          cls: badge.toneClass,
        })),
      ].filter(Boolean) as Array<{ id: string; label: string; cls: string }>;

  return (
    <div className="max-w-4xl mx-auto px-3 py-6 sm:px-6 sm:py-8">
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
              {t("profile.proMember")}
            </span>
          ) : (
            <Link href="/pricing" className="mt-1 inline-block text-sm text-[#66c0f4] hover:underline">
              {t("profile.freePlan")}
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2a475e] px-3 py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-[#3d6b8c] sm:px-4"
              >
                <span className="truncate">{t("profile.steamProfile")}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            )}
            {shareSlug && (
              <ShareProfileButton slug={shareSlug} displayName={displayName} />
            )}
            <Link
              href="/settings"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#66c0f4]/30 bg-[#1b2838] px-3 py-2.5 text-xs sm:text-sm font-medium text-[#66c0f4] transition-colors hover:bg-[#2a475e] sm:px-4"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className="truncate">{t("profile.edit")}</span>
            </Link>
          </>
        }
      />

      {!isSteamConnected && !isGoogleConnected && (
        <div className="rounded-2xl border border-dashed border-[#66c0f4]/30 bg-steam/10 p-6 mb-8 text-center">
          <Sparkles className="w-8 h-8 text-[#66c0f4] mx-auto mb-3" />
          <h2 className="font-semibold text-lg mb-1">{t("profile.connectAccountsTitle")}</h2>
          <p className="text-sm text-muted mb-4 max-w-md mx-auto">{t("profile.connectAccountsDesc")}</p>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b2838] text-white text-sm font-medium hover:bg-[#2a475e]"
          >
            <Settings className="w-4 h-4" />
            {t("profile.connectAccountsCta")}
          </Link>
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

      <section className="mb-6 rounded-2xl border border-[#2a475e]/50 bg-[#0e1419] p-4 sm:mb-8 sm:p-5">
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
          onUpdated={reloadAll}
        />
      )}

      {isSteamConnected && steamId && (
        <div className="mb-8">
          <SteamWishlistImport
            variant="profile"
            steamId={steamId}
            steamWishlistCount={steamData?.wishlist?.count}
            onImported={reloadAll}
          />
        </div>
      )}

      <ProfileLibrarySection steamConnected={isSteamConnected} />
      <LibraryInsightsPanel steamConnected={isSteamConnected} />

      {steamData?.wishlist && steamData.wishlist.items.length > 0 && (
        <section className="mb-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="font-semibold text-lg">{t("profile.steamWishlistPreview")}</h2>
            <span className="text-sm text-muted">
              {t("profile.steamWishlistCount", { count: String(steamData.wishlist.count) })}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {steamData.wishlist.items.map((item) => {
              const steamAppId = item.appId || extractSteamAppId(item.gameId || "");
              const imageUrl = resolveGameImage({
                imageUrl: item.imageUrl,
                steamAppId,
              });
              return (
              <Link
                key={item.appId || item.name}
                href={item.gameId ? `/game/${item.gameId}` : steamAppId ? `/game/steam-${steamAppId}` : "#"}
                className="group rounded-2xl overflow-hidden border border-border bg-card hover:border-accent/40 transition-all hover:-translate-y-0.5"
              >
                <div className="relative aspect-3/4 bg-background">
                  <GameImage
                    src={imageUrl}
                    steamAppId={steamAppId}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="p-2.5 text-xs font-medium line-clamp-2">{item.name}</p>
              </Link>
            );
            })}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg mb-4">{t("profile.viewed")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {recentlyViewed.slice(0, 8).map((game) => {
              const imageUrl = resolveGameImage({
                imageUrl: game.imageUrl,
                steamAppId: game.steamAppId ?? extractSteamAppId(game.gameId),
              });
              return (
              <Link
                key={game.gameId}
                href={`/game/${game.gameId}`}
                className="group rounded-2xl overflow-hidden border border-border bg-card hover:border-accent/40 transition-all hover:-translate-y-0.5"
              >
                <div className="relative aspect-3/4 bg-background">
                  <GameImage
                    src={imageUrl}
                    steamAppId={game.steamAppId ?? extractSteamAppId(game.gameId)}
                    alt={game.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="p-2 text-xs font-medium line-clamp-2">{game.title}</p>
              </Link>
            );
            })}
          </div>
        </section>
      )}

      {!profile?.email && !isSteamConnected && !isGoogleConnected && (
        <p className="text-center text-sm text-muted mt-8">{t("profile.empty")}</p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
