"use client";

import Link from "next/link";
import { SearchResult } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GameImage } from "@/components/ui/GameImage";
import { CompareButton } from "./CompareButton";
import { PlatformTags } from "./PlatformTags";
import { cn } from "@/lib/utils";
import { resolveGameImage } from "@/lib/game-images";

interface GameCardProps {
  game: SearchResult;
}

function metacriticColor(score: number) {
  if (score >= 75) return "bg-emerald-500/90";
  if (score >= 50) return "bg-yellow-500/90";
  return "bg-red-500/90";
}

export function GameCard({ game }: GameCardProps) {
  const imageUrl = resolveGameImage({
    imageUrl: game.imageUrl,
    steamAppId: game.steamAppId,
  });
  return (
    <div className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
      <Link href={`/game/${game.gameId}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-card-hover">
          <GameImage
            src={imageUrl}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {game.metacritic && game.metacritic > 0 && (
            <div
              className={cn(
                "absolute top-2 left-2 px-1.5 py-0.5 rounded text-white text-xs font-bold",
                metacriticColor(game.metacritic)
              )}
            >
              {game.metacritic}
            </div>
          )}
          {game.maxDiscount && game.maxDiscount > 0 && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-emerald-500/90 text-white text-xs font-bold">
              -%{game.maxDiscount}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors">
            {game.title}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            {game.cheapestPrice !== undefined && (
              <PriceDisplay
                amount={game.cheapestPrice}
                className="text-lg font-bold text-emerald-400"
              />
            )}
            {game.cheapestPlatform && (
              <span className="text-xs text-muted truncate">
                {game.cheapestPlatform}
              </span>
            )}
          </div>
          <PlatformTags platformIds={game.platforms} />
        </div>
      </Link>

      <div
        className="absolute bottom-14 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => e.preventDefault()}
      >
        <CompareButton
          gameId={game.gameId}
          gameTitle={game.title}
          imageUrl={imageUrl}
          variant="icon"
        />
      </div>
    </div>
  );
}
