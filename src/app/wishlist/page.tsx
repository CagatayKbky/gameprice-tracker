"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, Loader2, Crown, Gamepad2 } from "lucide-react";
import { WishlistItemData } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GameImage } from "@/components/ui/GameImage";
import { SteamWishlistImport } from "@/components/games/SteamWishlistImport";
import { BulkWishlistImport } from "@/components/games/BulkWishlistImport";
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

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/wishlist").then((r) => r.json()),
      fetch("/api/wishlist/subscriptions").then((r) => r.json()),
    ])
      .then(([wishlist, subs]) => {
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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">İstek Listesi</h1>
          <p className="text-muted mt-1">
            Takip ettiğiniz oyunlar ({items.length})
          </p>
        </div>
      </div>

      {onSubscription && (
        <div className="rounded-2xl bg-card border border-border p-5 mb-6">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-emerald-400" />
            {t("wishlist.subscription")}
          </h2>
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

      <SteamWishlistImport onImported={load} />
      <BulkWishlistImport onImported={load} />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-lg text-muted">İstek listeniz boş</p>
          <p className="text-sm text-muted mt-2">
            Oyun sayfalarından istek listesine ekleyebilirsiniz
          </p>
          <Link
            href="/search?q=game"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Oyun Ara
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors"
            >
              <Link
                href={`/game/${item.cheapSharkGameId}`}
                className="relative w-16 h-20 rounded-lg overflow-hidden bg-card-hover shrink-0"
              >
                <GameImage
                  src={item.imageUrl}
                  alt={item.gameTitle}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/game/${item.cheapSharkGameId}`}
                  className="font-medium text-sm line-clamp-2 hover:text-accent transition-colors"
                >
                  {item.gameTitle}
                </Link>
                {(item.gamepass || item.psplus) && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.gamepass && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
                        <Crown className="w-3 h-3" />
                        Game Pass
                      </span>
                    )}
                    {item.psplus && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                        <Crown className="w-3 h-3" />
                        PS Plus
                      </span>
                    )}
                  </div>
                )}
                {item.currentPrice !== undefined ? (
                  <div className="mt-1">
                    <PriceDisplay
                      amount={item.currentPrice}
                      className="text-lg font-bold text-emerald-400"
                    />
                    {item.cheapestPlatform && (
                      <p className="text-xs text-muted">{item.cheapestPlatform}</p>
                    )}
                  </div>
                ) : (
                  !item.gamepass &&
                  !item.psplus && (
                    <p className="text-xs text-muted mt-1 flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      {t("wishlist.buyInstead")}
                    </p>
                  )
                )}
              </div>
              <button
                onClick={() => removeItem(item.cheapSharkGameId)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors self-start"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
