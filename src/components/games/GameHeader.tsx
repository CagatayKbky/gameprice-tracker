"use client";

import { GameDeal } from "@/types";
import { PriceAlertButton, WishlistButton } from "./AlertButton";
import { CompareButton } from "./CompareButton";
import { ShareButton } from "./ShareButton";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Gamepad2, Crown } from "lucide-react";

interface GameHeaderProps {
  game: GameDeal;
  subscription: { gamepass: boolean; psplus: boolean };
}

export function GameHeader({ game, subscription }: GameHeaderProps) {
  return (
    <div className="flex-1">
      <h1 className="text-3xl sm:text-4xl font-bold">{game.title}</h1>

      {game.steamRating && (
        <p className="text-sm text-muted mt-2">
          Steam: %{game.steamRating} olumlu
          {game.steamRatingText && ` (${game.steamRatingText})`}
        </p>
      )}

      {game.metacritic && (
        <div className="mt-2 inline-flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-sm font-bold ${
              game.metacritic >= 75
                ? "bg-emerald-500/20 text-emerald-400"
                : game.metacritic >= 50
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {game.metacritic}
          </span>
          <span className="text-sm text-muted">Metacritic</span>
        </div>
      )}

      {game.cheapestStore && (
        <div className="mt-4 flex items-baseline gap-3 flex-wrap">
          <PriceDisplay
            amount={game.cheapestStore.price}
            className="text-3xl font-bold text-emerald-400"
          />
          {game.cheapestStore.discount > 0 && (
            <>
              <PriceDisplay
                amount={game.cheapestStore.normalPrice}
                className="text-lg text-muted line-through"
              />
              <span className="text-lg font-bold text-emerald-400">
                -%{game.cheapestStore.discount}
              </span>
            </>
          )}
        </div>
      )}

      {game.cheapestStore && (
        <p className="text-sm text-muted mt-1">
          En ucuz: {game.cheapestStore.platformName}
        </p>
      )}

      {(subscription.gamepass || subscription.psplus) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {subscription.gamepass && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-sm border border-green-500/30">
              <Crown className="w-4 h-4" />
              Xbox Game Pass&apos;te
            </span>
          )}
          {subscription.psplus && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/30">
              <Crown className="w-4 h-4" />
              PS Plus&apos;ta
            </span>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {game.cheapestStore && game.cheapestStore.price > 0 && (
          <PriceAlertButton
            gameId={game.gameId}
            gameTitle={game.title}
            currentPrice={game.cheapestStore.price}
          />
        )}
        <WishlistButton
          gameId={game.gameId}
          gameTitle={game.title}
          imageUrl={game.imageUrl}
        />
        <CompareButton
          gameId={game.gameId}
          gameTitle={game.title}
          imageUrl={game.imageUrl}
        />
        <ShareButton gameId={game.gameId} title={game.title} />
        {game.cheapestStore && game.cheapestStore.price > 0 && (
          <a
            href={game.cheapestStore.dealUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium"
          >
            <Gamepad2 className="w-4 h-4" />
            Satın Al — <PriceDisplay amount={game.cheapestStore.price} />
          </a>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted">Mağaza Sayısı</p>
          <p className="text-2xl font-bold mt-1">{game.stores.length}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted">En Düşük</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">
            {game.currentLow ? <PriceDisplay amount={game.currentLow} /> : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted">Tarihi En Düşük</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">
            {game.historicalLow ? <PriceDisplay amount={game.historicalLow} /> : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
