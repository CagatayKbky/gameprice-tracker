"use client";

import Link from "next/link";
import { Trash2, Crown } from "lucide-react";
import { WishlistItemData } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GameImage } from "@/components/ui/GameImage";
import { resolveGameImage } from "@/lib/game-images";
import { extractSteamAppId } from "@/lib/game-id";

interface WishlistCardProps {
  item: WishlistItemData;
  onRemove: (gameId: string) => void;
  buyInsteadLabel: string;
}

export function WishlistCard({ item, onRemove, buyInsteadLabel }: WishlistCardProps) {
  const steamAppId = extractSteamAppId(item.cheapSharkGameId);
  const imageUrl = resolveGameImage({
    imageUrl: item.imageUrl,
    steamAppId,
  });

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border/80 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
      <Link href={`/game/${item.cheapSharkGameId}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-card-hover">
          <GameImage
            src={imageUrl}
            steamAppId={steamAppId}
            alt={item.gameTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          {(item.gamepass || item.psplus) && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {item.gamepass && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-500/90 text-white font-medium">
                  <Crown className="w-3 h-3" />
                  Game Pass
                </span>
              )}
              {item.psplus && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/90 text-white font-medium">
                  <Crown className="w-3 h-3" />
                  PS Plus
                </span>
              )}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-sm font-medium line-clamp-2 text-white group-hover:text-indigo-200 transition-colors">
              {item.gameTitle}
            </p>
            {item.currentPrice !== undefined ? (
              <div className="mt-1">
                <PriceDisplay
                  amount={item.currentPrice}
                  className="text-base font-bold text-emerald-300"
                />
                {item.cheapestPlatform && (
                  <p className="text-[10px] text-white/60">{item.cheapestPlatform}</p>
                )}
              </div>
            ) : (
              !item.gamepass &&
              !item.psplus && (
                <p className="text-[10px] text-white/60 mt-1">{buyInsteadLabel}</p>
              )
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={() => onRemove(item.cheapSharkGameId)}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white/80 hover:bg-red-500/80 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Remove"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
