"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Search, UserPlus, Users, X } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { LeaderboardPanel } from "@/components/social/LeaderboardPanel";
import { ReferralPanel } from "@/components/social/ReferralPanel";

interface SocialProfile {
  sessionId: string;
  name: string | null;
  steamPersona: string | null;
  steamAvatar: string | null;
  steamId: string | null;
  profileSlug?: string | null;
  isAdmin: boolean;
  plan: string;
  wishlistCount?: number;
  libraryCount?: number;
  steamLibrarySyncedAt?: string | null;
  recentWishlist?: {
    gameTitle: string;
    addedAt: string;
  } | null;
}

interface SocialActivity {
  id: string;
  type: "wishlist_add" | "library_sync" | "cosmetic_unlock" | "alert_hit" | "pro_join";
  at: string;
  profile: SocialProfile;
  gameTitle?: string;
  gameId?: string;
  cosmeticLabel?: string;
  price?: number;
}

interface SocialItem {
  id: string;
  profile: SocialProfile | null;
}

export default function SocialPage() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [discover, setDiscover] = useState<SocialProfile[]>([]);
  const [incoming, setIncoming] = useState<SocialItem[]>([]);
  const [outgoing, setOutgoing] = useState<SocialItem[]>([]);
  const [friends, setFriends] = useState<SocialItem[]>([]);
  const [activity, setActivity] = useState<SocialActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (q?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q?.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/social?${params.toString()}`);
    const data = await res.json();
    setDiscover(data.discover || []);
    setIncoming(data.social?.incoming || []);
    setOutgoing(data.social?.outgoing || []);
    setFriends(data.social?.friends || []);
    setActivity(data.activity || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const sendRequest = async (toSessionId: string) => {
    await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toSessionId }),
    });
    await load(query);
  };

  const respond = async (requestId: string, action: "accept" | "reject") => {
    await fetch("/api/social/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    await load(query);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("social.title")}</h1>
          <p className="text-muted text-sm mt-1">{t("social.subtitle")}</p>
        </div>
      </div>

      <LeaderboardPanel />
      <ReferralPanel />

      <div className="rounded-2xl border border-border bg-card p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void load(query)}
            placeholder={t("social.search")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm"
          />
        </div>
      </div>

      {activity.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold mb-4">{t("social.activity")}</h2>
          <div className="grid gap-3">
            {activity.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {item.profile.steamAvatar ? (
                  <Image
                    src={item.profile.steamAvatar}
                    alt={item.profile.steamPersona || "Friend"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/10" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <Link
                      href={`/u/${item.profile.profileSlug || item.profile.steamId}`}
                      className="font-medium hover:text-accent"
                    >
                      {item.profile.steamPersona || "Player"}
                    </Link>{" "}
                    {item.type === "wishlist_add"
                      ? t("social.activityWishlistAdd", { game: item.gameTitle || "" })
                      : item.type === "library_sync"
                        ? t("social.activityLibrarySync")
                        : item.type === "cosmetic_unlock"
                          ? t("social.activityCosmetic", { label: item.cosmeticLabel || "" })
                          : item.type === "alert_hit"
                            ? t("social.activityAlertHit", {
                                game: item.gameTitle || "",
                                price: item.price ? `$${item.price.toFixed(2)}` : "",
                              })
                            : t("social.activityProJoin")}
                  </p>
                  <p className="text-xs text-muted mt-1">{formatRelative(item.at, t)}</p>
                </div>
                {item.gameId && (
                  <Link href={`/game/${item.gameId}`} className="text-xs text-accent hover:underline shrink-0 self-start sm:self-center">
                    {t("social.activityViewGame")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="font-semibold mb-4">{t("social.requests")}</h2>
        <div className="grid gap-3">
          {incoming.length === 0 ? (
            <p className="text-sm text-muted">{t("social.noRequests")}</p>
          ) : (
            incoming.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ProfileLine profile={item.profile} />
                <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
                  <button onClick={() => void respond(item.id, "accept")} className="flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs sm:text-sm">
                    <Check className="w-4 h-4 inline mr-1" />
                    {t("social.accept")}
                  </button>
                  <button onClick={() => void respond(item.id, "reject")} className="flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 text-xs sm:text-sm">
                    <X className="w-4 h-4 inline mr-1" />
                    {t("social.reject")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-4">{t("social.friends")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {friends.length === 0 ? (
            <p className="text-sm text-muted">{t("social.noFriends")}</p>
          ) : (
            friends.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card p-4">
                <ProfileLine profile={item.profile} />
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-4">{t("social.discover")}</h2>
        {loading ? (
          <div className="h-24 rounded-xl bg-card animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {discover.map((profile) => (
              <div key={profile.sessionId} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <ProfileLine profile={profile} />
                <button
                  onClick={() => void sendRequest(profile.sessionId)}
                  className="shrink-0 self-stretch sm:self-auto px-3 py-2 rounded-lg bg-accent text-white text-xs sm:text-sm"
                >
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  {t("social.add")}
                </button>
              </div>
            ))}
          </div>
        )}
        {outgoing.length > 0 && (
          <p className="text-sm text-muted mt-4">
            {t("social.pendingOutgoing", { count: String(outgoing.length) })}
          </p>
        )}
      </section>
    </div>
  );
}

function formatRelative(value: string | null | undefined, t: (key: string, params?: Record<string, string>) => string) {
  if (!value) return null;
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const hours = Math.max(1, Math.round(diff / (1000 * 60 * 60)));
  if (hours < 24) return t("social.timeHoursAgo", { count: String(hours) });
  const days = Math.round(hours / 24);
  return t("social.timeDaysAgo", { count: String(days) });
}

function ProfileLine({ profile }: { profile: SocialProfile | null }) {
  const { t } = useLocale();
  if (!profile) return <span className="text-sm text-muted">-</span>;
  const name = profile.steamPersona || profile.name || "Player";
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        {profile.steamAvatar ? (
          <Image src={profile.steamAvatar} alt={name} width={44} height={44} className="w-11 h-11 rounded-xl object-cover" />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-accent/10" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{name}</p>
            {profile.isAdmin && <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 text-[11px] border border-red-500/30">Admin</span>}
            {profile.plan === "pro" && <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] border border-amber-500/30">Pro</span>}
          </div>
          {profile.steamId ? (
            <Link
              href={`/u/${profile.profileSlug || profile.steamId}`}
              className="text-xs text-muted hover:text-accent"
            >
              {t("social.publicProfile")}
            </Link>
          ) : (
            <span className="text-xs text-muted">Steam</span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-background border border-border px-3 py-2">
          <span className="text-muted">{t("social.statsWishlist")}</span>
          <p className="font-semibold mt-1">{profile.wishlistCount || 0}</p>
        </div>
        <div className="rounded-lg bg-background border border-border px-3 py-2">
          <span className="text-muted">{t("social.statsLibrary")}</span>
          <p className="font-semibold mt-1">{profile.libraryCount || 0}</p>
        </div>
      </div>

      {(profile.recentWishlist || profile.steamLibrarySyncedAt) && (
        <div className="mt-3 space-y-1 text-xs text-muted">
          {profile.recentWishlist && (
            <p>
              {t("social.lastWishlistAdd")}:{" "}
              <span className="text-foreground">{profile.recentWishlist.gameTitle}</span>{" "}
              <span className="text-muted">({formatRelative(profile.recentWishlist.addedAt, t)})</span>
            </p>
          )}
          {profile.steamLibrarySyncedAt && (
            <p>
              {t("social.librarySync")}: {formatRelative(profile.steamLibrarySyncedAt, t)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
