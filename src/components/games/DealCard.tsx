"use client";

import Link from "next/link";
import { DealOfTheDay } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GameImage } from "@/components/ui/GameImage";
import { HistoricalLowBadge } from "./HistoricalLowBadge";
import { DlcBadge } from "./DlcBadge";
import { OwnedBadge } from "./OwnedBadge";
import { useOwnedGames } from "@/hooks/useOwnedGames";
import { resolveGameImage } from "@/lib/game-images";
import { extractSteamAppId } from "@/lib/game-id";

interface DealCardProps {
  deal: DealOfTheDay;
  variant?: "horizontal" | "vertical";
}

export function DealCard({ deal, variant = "vertical" }: DealCardProps) {
  const { isOwned } = useOwnedGames();
  const steamAppId = extractSteamAppId(deal.gameId, deal.steamAppId);
  const owned = isOwned(deal.gameId, steamAppId);
  const imageUrl = resolveGameImage({
    imageUrl: deal.imageUrl,
    steamAppId,
  });

  if (variant === "horizontal") {
    return (
      <Link
        href={`/game/${deal.gameId}`}
        className="group relative flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-300 overflow-hidden"
      >
        <div className="card-shine absolute inset-0 pointer-events-none" />
        <div className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-lg overflow-hidden shrink-0 bg-card-hover">
          <GameImage
            src={imageUrl}
            steamAppId={steamAppId}
            alt={deal.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {owned && <OwnedBadge compact />}
          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-xs font-bold">
            -%{deal.discount}
          </div>
          {deal.isHistoricalLow && <HistoricalLowBadge compact />}
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-accent transition-colors">
            {deal.title}
          </h3>
          <DlcBadge title={deal.title} className="mt-1" />
          <p className="text-xs text-muted mt-1">{deal.platformName}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <PriceDisplay amount={deal.salePrice} className="text-xl font-bold text-emerald-400" />
            <PriceDisplay amount={deal.normalPrice} className="text-sm text-muted line-through" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/game/${deal.gameId}`}
      className="group relative rounded-2xl overflow-hidden bg-card border border-border/80 hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
    >
      <div className="card-shine absolute inset-0 pointer-events-none z-10" />
      <div className="relative aspect-[3/4] overflow-hidden bg-card-hover">
        <GameImage
          src={imageUrl}
          steamAppId={deal.steamAppId}
          alt={deal.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {owned && <OwnedBadge compact />}
        {deal.discount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-lg">
            -%{deal.discount}
          </div>
        )}
        {deal.isHistoricalLow && <HistoricalLowBadge compact />}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-semibold text-sm line-clamp-2 text-white drop-shadow-sm group-hover:text-indigo-200 transition-colors">
            {deal.title}
          </h3>
          <DlcBadge title={deal.title} className="mt-1 [&_span]:text-white/80" />
          <p className="text-[10px] text-white/60 mt-0.5">{deal.platformName}</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <PriceDisplay amount={deal.salePrice} className="text-base font-bold text-emerald-300" />
            {deal.normalPrice > deal.salePrice && (
              <PriceDisplay amount={deal.normalPrice} className="text-xs text-white/50 line-through" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
