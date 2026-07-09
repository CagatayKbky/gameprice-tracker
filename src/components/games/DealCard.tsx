"use client";

import Link from "next/link";
import { DealOfTheDay } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GameImage } from "@/components/ui/GameImage";
import { HistoricalLowBadge } from "./HistoricalLowBadge";
import { DlcBadge } from "./DlcBadge";

interface DealCardProps {
  deal: DealOfTheDay;
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <Link
      href={`/game/${deal.gameId}`}
      className="group relative flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-300 overflow-hidden"
    >
      <div className="card-shine absolute inset-0 pointer-events-none" />
      <div className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-lg overflow-hidden shrink-0 bg-card-hover">
        <GameImage
          src={deal.imageUrl}
          alt={deal.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="112px"
        />
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
        {deal.isHistoricalLow && (
          <div className="mt-1">
            <HistoricalLowBadge />
          </div>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <PriceDisplay
            amount={deal.salePrice}
            className="text-xl font-bold text-emerald-400"
          />
          <PriceDisplay
            amount={deal.normalPrice}
            className="text-sm text-muted line-through"
          />
        </div>
      </div>
    </Link>
  );
}
