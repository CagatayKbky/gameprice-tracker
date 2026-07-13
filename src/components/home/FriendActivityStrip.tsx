"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Loader2 } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getPublicProfilePath } from "@/lib/profile/profile-slug";

interface ActivityItem {
  id: string;
  type: string;
  at: string;
  profile: {
    steamPersona: string | null;
    steamAvatar: string | null;
    name?: string | null;
    steamId?: string | null;
    profileSlug?: string | null;
  };
  gameTitle?: string;
  gameId?: string;
  cosmeticLabel?: string;
  price?: number;
}

function formatRelative(value: string, t: (key: string, params?: Record<string, string>) => string) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.max(1, Math.round(diff / (1000 * 60 * 60)));
  if (hours < 24) return t("social.timeHoursAgo", { count: String(hours) });
  const days = Math.round(hours / 24);
  return t("social.timeDaysAgo", { count: String(days) });
}

export function FriendActivityStrip() {
  const { t } = useLocale();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<{ activity?: ActivityItem[] }>("/api/social", 10_000)
      .then((data) => setActivity((data.activity || []).slice(0, 5)))
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (activity.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          {t("home.friendActivity.title")}
        </h2>
        <Link href="/social" className="text-sm text-accent hover:underline">
          {t("home.friendActivity.seeAll")}
        </Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {activity.map((item) => {
          const displayName = item.profile.steamPersona || item.profile.name || "Player";
          const avatar = item.profile.steamAvatar;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-3 flex items-start gap-3"
            >
              {avatar ? (
                <Image src={avatar} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent/10 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-relaxed">
                  <Link
                    href={getPublicProfilePath(item.profile) || "#"}
                    className="font-medium hover:text-accent"
                  >
                    {displayName}
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
                <p className="text-[10px] text-muted mt-1">{formatRelative(item.at, t)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
