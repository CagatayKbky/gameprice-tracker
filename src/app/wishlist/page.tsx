"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { WishlistItemData } from "@/types";
import { SteamWishlistImport } from "@/components/games/SteamWishlistImport";
import { WishlistSavingsBanner } from "@/components/wishlist/WishlistSavingsBanner";
import { BulkWishlistImport } from "@/components/games/BulkWishlistImport";
import { WishlistCard } from "@/components/games/WishlistCard";
import { GameGrid } from "@/components/layout/GameGrid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useLocale } from "@/components/providers/LocaleProvider";

interface SubscriptionData {
  items: Array<{ gameId: string; gamepass: boolean; psplus: boolean }>;
  summary: { gamepass: number; psplus: number };
}

export default function WishlistPage() {
  const { t } = useLocale();
  const [items, setItems] = useState<WishlistItemData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [steamId, setSteamId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/wishlist").then((r) => r.json()),
      fetch("/api/wishlist/subscriptions").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ])
      .then(([wishlist, subs, prof]) => {
        setSteamId(prof.steamId || null);
        const subMap = new Map<string, { gamepass: boolean; psplus: boolean }>(
          (subs.items || []).map(
            (s: { gameId: string; gamepass: boolean; psplus: boolean }) =>
              [s.gameId, { gamepass: s.gamepass, psplus: s.psplus }] as const
          )
        );
        const merged = (wishlist as WishlistItemData[]).map((item) => {
          const sub = subMap.get(item.cheapSharkGameId);
          return {
            ...item,
            gamepass: sub?.gamepass,
            psplus: sub?.psplus,
          };
        });
        setItems(merged);
        setSubscriptions(subs);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const removeItem = async (gameId: string) => {
    await fetch(`/api/wishlist?gameId=${gameId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.cheapSharkGameId !== gameId));
  };

  const onSubscription =
    subscriptions &&
    (subscriptions.summary.gamepass > 0 || subscriptions.summary.psplus > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SectionHeader
        icon={Heart}
        iconClassName="text-pink-400"
        title={t("nav.wishlist")}
        subtitle={`${items.length} ${t("profile.wishlist").toLowerCase()}`}
        as="h1"
      />

      {onSubscription && (
        <div className="rounded-2xl bg-card border border-border p-5 mb-6">
          <h2 className="font-semibold mb-3">{t("wishlist.subscription")}</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            {subscriptions!.summary.gamepass > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                {subscriptions!.summary.gamepass} {t("wishlist.gamepass")}
              </span>
            )}
            {subscriptions!.summary.psplus > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {subscriptions!.summary.psplus} {t("wishlist.psplus")}
              </span>
            )}
          </div>
        </div>
      )}

      <WishlistSavingsBanner />

      <SteamWishlistImport onImported={load} defaultProfile={steamId || undefined} />
      <BulkWishlistImport onImported={load} />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-card/50">
          <Heart className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-lg text-muted">{t("wishlist.empty")}</p>
          <p className="text-sm text-muted mt-2">{t("wishlist.emptyHint")}</p>
          <Link
            href="/search?q=game"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            {t("about.searchGames")}
          </Link>
        </div>
      ) : (
        <GameGrid dense>
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={removeItem}
              buyInsteadLabel={t("wishlist.buyInstead")}
            />
          ))}
        </GameGrid>
      )}
    </div>
  );
}
