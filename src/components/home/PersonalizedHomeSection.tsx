"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameImage } from "@/components/ui/GameImage";
import { resolveGameImage } from "@/lib/game-images";
import { Sparkles, Library, Heart, Loader2 } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";
import { useLocale } from "@/components/providers/LocaleProvider";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { WorthItScoreBadge } from "@/components/games/WorthItScoreBadge";
import { HistoricalLowBadge } from "@/components/games/HistoricalLowBadge";

interface PersonalizedDeal {
  gameId: string;
  title: string;
  imageUrl?: string | null;
  price: number;
  discount: number;
  platform: string;
  worthItScore: number;
  isHistoricalLow: boolean;
}

interface PersonalizedData {
  connected: boolean;
  steamPersona?: string | null;
  libraryCount?: number;
  wishlistOnSale?: number;
  totalSavings?: number;
  deals?: PersonalizedDeal[];
  friendDeals?: Array<PersonalizedDeal & { friendName: string; friendCount: number }>;
}

export function PersonalizedHomeSection() {
  const { t } = useLocale();
  const [data, setData] = useState<PersonalizedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<PersonalizedData>("/api/home/personalized", 12_000)
      .then(setData)
      .catch(() => setData({ connected: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-40 rounded-2xl bg-card border border-border animate-pulse" />
      </section>
    );
  }

  if (!data?.connected || (!data.deals?.length && !data.friendDeals?.length)) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-accent font-medium flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4" />
            {t("home.personalized.badge")}
          </p>
          <h2 className="text-2xl font-bold">
            {t("home.personalized.title", {
              name: data.steamPersona || t("profile.guestName"),
            })}
          </h2>
          <p className="text-sm text-muted mt-1">
            {data.wishlistOnSale
              ? t("home.personalized.subtitle", { count: String(data.wishlistOnSale) })
              : t("home.personalized.subtitleEmpty")}
            {data.libraryCount ? ` · ${data.libraryCount} ${t("home.personalized.library")}` : ""}
          </p>
        </div>
        {data.totalSavings != null && data.totalSavings > 0 && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-sm">
            <span className="text-emerald-300 font-semibold">
              {t("home.personalized.savings")}:{" "}
              <PriceDisplay amount={data.totalSavings} className="inline font-bold" />
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(data.deals || []).map((deal) => (
          <Link
            key={deal.gameId}
            href={`/game/${deal.gameId}`}
            className="group rounded-xl overflow-hidden border border-border bg-card hover:border-accent/40 transition-all hover:-translate-y-0.5"
          >
            <div className="relative aspect-[3/4] bg-background">
              <GameImage
                src={resolveGameImage({
                  imageUrl: deal.imageUrl,
                  steamAppId: deal.gameId.startsWith("steam-")
                    ? deal.gameId.replace("steam-", "")
                    : undefined,
                })}
                steamAppId={
                  deal.gameId.startsWith("steam-")
                    ? deal.gameId.replace("steam-", "")
                    : undefined
                }
                alt={deal.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-500/90 text-white text-[10px] font-bold">
                -%{deal.discount}
              </div>
              {deal.isHistoricalLow && <HistoricalLowBadge compact />}
              <div className="absolute bottom-1.5 left-1.5">
                <WorthItScoreBadge score={deal.worthItScore} compact />
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs font-medium line-clamp-2">{deal.title}</p>
              <PriceDisplay amount={deal.price} className="text-sm font-bold text-emerald-400 mt-1" />
            </div>
          </Link>
        ))}
      </div>

      {data.friendDeals && data.friendDeals.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">{t("home.personalized.friendDeals")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.friendDeals.map((deal) => (
              <Link
                key={`friend-${deal.gameId}`}
                href={`/game/${deal.gameId}`}
                className="group rounded-xl overflow-hidden border border-border bg-card hover:border-accent/40 transition-all"
              >
                <div className="relative aspect-[16/9] bg-background">
                  <GameImage
                    src={resolveGameImage({
                      imageUrl: deal.imageUrl,
                      steamAppId: deal.gameId.startsWith("steam-")
                        ? deal.gameId.replace("steam-", "")
                        : undefined,
                    })}
                    steamAppId={
                      deal.gameId.startsWith("steam-")
                        ? deal.gameId.replace("steam-", "")
                        : undefined
                    }
                    alt={deal.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-sky-500/90 text-white text-[10px] font-bold">
                    -%{deal.discount}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2">{deal.title}</p>
                  <p className="text-xs text-muted mt-1">
                    {t("home.personalized.friendAlsoWants", { count: String(deal.friendCount) })}
                  </p>
                  <PriceDisplay amount={deal.price} className="text-sm font-bold text-emerald-400 mt-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <Link
          href="/wishlist"
          className="text-sm text-accent hover:underline inline-flex items-center gap-1"
        >
          <Heart className="w-3.5 h-3.5" />
          {t("home.personalized.wishlist")}
        </Link>
        <Link
          href="/profile"
          className="text-sm text-muted hover:text-accent inline-flex items-center gap-1"
        >
          <Library className="w-3.5 h-3.5" />
          {t("home.personalized.profile")}
        </Link>
      </div>
    </section>
  );
}
