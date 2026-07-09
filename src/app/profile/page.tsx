"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Heart,
  Bell,
  Clock,
  Settings,
  Loader2,
  Mail,
} from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useRecentlyViewed } from "@/components/providers/RecentlyViewedProvider";

interface ProfileData {
  email: string | null;
  name: string | null;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  pushNotifications: boolean;
}

export default function ProfilePage() {
  const { t } = useLocale();
  const { games: recentlyViewed } = useRecentlyViewed();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/wishlist").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
    ])
      .then(([prof, wishlist, alerts]) => {
        setProfile(prof);
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
        setAlertCount(
          Array.isArray(alerts)
            ? alerts.filter((a: { isActive: boolean }) => a.isActive).length
            : 0
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
          <User className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("profile.title")}</h1>
          <p className="text-muted text-sm mt-1">{t("profile.subtitle")}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {profile?.name || (profile?.email ? profile.email.split("@")[0] : "Oyuncu")}
            </h2>
            {profile?.email ? (
              <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {profile.email}
              </p>
            ) : (
              <p className="text-sm text-muted mt-1">{t("profile.empty")}</p>
            )}
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
          >
            <Settings className="w-4 h-4" />
            {t("profile.edit")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/wishlist"
          className="rounded-2xl bg-card border border-border p-5 hover:border-accent/30 transition-colors"
        >
          <Heart className="w-5 h-5 text-pink-400 mb-2" />
          <p className="text-2xl font-bold">{wishlistCount}</p>
          <p className="text-sm text-muted">{t("profile.wishlist")}</p>
        </Link>
        <Link
          href="/alerts"
          className="rounded-2xl bg-card border border-border p-5 hover:border-accent/30 transition-colors"
        >
          <Bell className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold">{alertCount}</p>
          <p className="text-sm text-muted">{t("profile.alerts")}</p>
        </Link>
        <div className="rounded-2xl bg-card border border-border p-5">
          <Clock className="w-5 h-5 text-muted mb-2" />
          <p className="text-2xl font-bold">{recentlyViewed.length}</p>
          <p className="text-sm text-muted">{t("profile.viewed")}</p>
        </div>
      </div>

      {recentlyViewed.length > 0 && (
        <section>
          <h3 className="font-semibold mb-3">{t("profile.viewed")}</h3>
          <div className="flex flex-wrap gap-2">
            {recentlyViewed.slice(0, 8).map((game) => (
              <Link
                key={game.gameId}
                href={`/game/${game.gameId}`}
                className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm hover:border-accent/30 transition-colors"
              >
                {game.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
