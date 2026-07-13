"use client";

import Link from "next/link";
import { SearchResult } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GameImage } from "@/components/ui/GameImage";
import { CompareButton } from "./CompareButton";
import { PlatformTags } from "./PlatformTags";
import { HistoricalLowBadge } from "./HistoricalLowBadge";
import { WorthItScoreBadge } from "./WorthItScoreBadge";
import { OwnedBadge } from "./OwnedBadge";
import { cn } from "@/lib/utils";
import { resolveGameImage } from "@/lib/game-images";
import { extractSteamAppId } from "@/lib/game-id";
import { useOwnedGames } from "@/hooks/useOwnedGames";
import { calculateWorthItScore } from "@/lib/worth-it-score";

interface GameCardProps {
  game: SearchResult;
}

function metacriticColor(score: number) {
  if (score >= 75) return "bg-emerald-500/90";
  if (score >= 50) return "bg-yellow-500/90";
  return "bg-red-500/90";
}

export function GameCard({ game }: GameCardProps) {
  const { isOwned } = useOwnedGames();
  const steamAppId = extractSteamAppId(game.gameId, game.steamAppId);
  const imageUrl = resolveGameImage({
    imageUrl: game.imageUrl,
    steamAppId,
  });

  const owned = isOwned(game.gameId, steamAppId);
  const worthItScore =
    game.worthItScore ??
    (game.cheapestPrice !== undefined
      ? calculateWorthItScore({
          currentPrice: game.cheapestPrice,
          historicalLow: game.historicalLow,
          discount: game.maxDiscount,
          metacritic: game.metacritic,
        })
      : undefined);

  const showAtl =
    game.isHistoricalLow ||
    (game.historicalLow != null &&
      game.cheapestPrice != null &&
      game.cheapestPrice <= game.historicalLow * 1.05);

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border/80 hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      <Link href={`/game/${game.gameId}`} className="block">
        <div className="relative aspect-3/4 overflow-hidden bg-card-hover">
          <GameImage
            src={imageUrl}
            steamAppId={steamAppId}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {owned && <OwnedBadge compact />}
          {game.metacritic && game.metacritic > 0 && !owned && (
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
          {showAtl && <HistoricalLowBadge compact />}
          {worthItScore != null && worthItScore >= 70 && (
            <div className="absolute bottom-2 left-2">
              <WorthItScoreBadge score={worthItScore} compact />
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
              <span className="text-xs text-muted truncate">{game.cheapestPlatform}</span>
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
