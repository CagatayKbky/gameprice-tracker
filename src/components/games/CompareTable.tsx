"use client";

import Link from "next/link";
import { GameDeal } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GameImage } from "@/components/ui/GameImage";
import { resolveGameImage } from "@/lib/game-images";
import { extractSteamAppId } from "@/lib/game-id";
import { PlatformBadge } from "./PlatformBadge";
import { WorthItScoreBadge } from "./WorthItScoreBadge";
import { calculateWorthItScore } from "@/lib/worth-it-score";
import { ExternalLink } from "lucide-react";

interface CompareTableProps {
  games: GameDeal[];
}

export function CompareTable({ games }: CompareTableProps) {
  const rows = [
    { label: "En Ucuz Fiyat", key: "cheapest" },
    { label: "En Düşük", key: "currentLow" },
    { label: "Tarihi En Düşük", key: "historicalLow" },
    { label: "Değer Skoru", key: "worthIt" },
    { label: "Mağaza Sayısı", key: "storeCount" },
    { label: "Metacritic", key: "metacritic" },
  ];

  const allPlatforms = Array.from(
    new Set(games.flatMap((g) => g.stores.map((s) => s.platformId)))
  );

  return (
    <>
      <div className="md:hidden space-y-4">
        {games.map((game) => {
          const steamAppId = extractSteamAppId(game.gameId);
          const imageUrl = resolveGameImage({ imageUrl: game.imageUrl, steamAppId });
          return (
          <div key={game.gameId} className="rounded-2xl border border-border bg-card p-4">
            <Link href={`/game/${game.gameId}`} className="group flex gap-3 mb-4">
              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-card-hover shrink-0">
                <GameImage
                  src={imageUrl}
                  steamAppId={steamAppId}
                  alt={game.title}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-semibold text-sm line-clamp-3 group-hover:text-accent">{game.title}</p>
            </Link>
            <dl className="space-y-2 text-sm">
              {rows.map((row) => (
                <div key={row.key} className="flex justify-between gap-3 border-t border-border/50 pt-2">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="text-right font-medium">
                    {row.key === "cheapest" && game.cheapestStore && (
                      <div>
                        <PriceDisplay amount={game.cheapestStore.price} className="text-emerald-400" />
                        <p className="text-xs text-muted">{game.cheapestStore.platformName}</p>
                      </div>
                    )}
                    {row.key === "currentLow" && game.currentLow && (
                      <PriceDisplay amount={game.currentLow} className="text-emerald-400" />
                    )}
                    {row.key === "historicalLow" && game.historicalLow && (
                      <PriceDisplay amount={game.historicalLow} />
                    )}
                    {row.key === "worthIt" && game.cheapestStore && (
                      <WorthItScoreBadge
                        score={calculateWorthItScore({
                          currentPrice: game.cheapestStore.price,
                          historicalLow: game.historicalLow,
                          discount: game.cheapestStore.discount,
                          metacritic: game.metacritic,
                        })}
                      />
                    )}
                    {row.key === "storeCount" && game.stores.length}
                    {row.key === "metacritic" && (game.metacritic || "—")}
                  </dd>
                </div>
              ))}
              {allPlatforms.map((platformId) => {
                const store = game.stores.find((s) => s.platformId === platformId);
                if (!store) return null;
                return (
                  <div key={platformId} className="flex justify-between gap-3 border-t border-border/50 pt-2 items-center">
                    <PlatformBadge platformId={platformId} size="sm" />
                    <div className="text-right">
                      <PriceDisplay
                        amount={store.price}
                        className={store.discount > 0 ? "text-emerald-400" : ""}
                      />
                      {store.discount > 0 && (
                        <span className="text-xs text-emerald-400">-%{store.discount}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>
          );
        })}
      </div>

      <div className="hidden md:block -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 overscroll-x-contain">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              <th className="p-4 text-left text-sm text-muted w-40" />
              {games.map((game) => {
                const steamAppId = extractSteamAppId(game.gameId);
                const imageUrl = resolveGameImage({ imageUrl: game.imageUrl, steamAppId });
                return (
                <th key={game.gameId} className="p-4 text-center align-top">
                  <Link href={`/game/${game.gameId}`} className="group">
                    <div className="relative w-28 h-36 mx-auto rounded-xl overflow-hidden bg-card-hover mb-3">
                      <GameImage
                        src={imageUrl}
                        steamAppId={steamAppId}
                        alt={game.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="112px"
                      />
                    </div>
                    <p className="font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">
                      {game.title}
                    </p>
                  </Link>
                </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-border">
                <td className="p-4 text-sm text-muted font-medium">{row.label}</td>
                {games.map((game) => (
                  <td key={game.gameId} className="p-4 text-center">
                    {row.key === "cheapest" && game.cheapestStore && (
                      <div>
                        <PriceDisplay
                          amount={game.cheapestStore.price}
                          className="text-lg font-bold text-emerald-400"
                        />
                        <p className="text-xs text-muted mt-1">
                          {game.cheapestStore.platformName}
                        </p>
                      </div>
                    )}
                    {row.key === "currentLow" && game.currentLow && (
                      <PriceDisplay
                        amount={game.currentLow}
                        className="font-bold text-emerald-400"
                      />
                    )}
                    {row.key === "historicalLow" && game.historicalLow && (
                      <PriceDisplay amount={game.historicalLow} className="font-bold" />
                    )}
                    {row.key === "worthIt" && game.cheapestStore && (
                      <WorthItScoreBadge
                        score={calculateWorthItScore({
                          currentPrice: game.cheapestStore.price,
                          historicalLow: game.historicalLow,
                          discount: game.cheapestStore.discount,
                          metacritic: game.metacritic,
                        })}
                      />
                    )}
                    {row.key === "storeCount" && (
                      <span className="text-xl font-bold">{game.stores.length}</span>
                    )}
                    {row.key === "metacritic" && (
                      <span className="text-xl font-bold">{game.metacritic || "—"}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {allPlatforms.map((platformId) => (
              <tr key={platformId} className="border-t border-border">
                <td className="p-4">
                  <PlatformBadge platformId={platformId} size="sm" />
                </td>
                {games.map((game) => {
                  const store = game.stores.find((s) => s.platformId === platformId);
                  return (
                    <td key={game.gameId} className="p-4 text-center">
                      {store ? (
                        <div>
                          <PriceDisplay
                            amount={store.price}
                            className={`font-bold ${store.discount > 0 ? "text-emerald-400" : ""}`}
                          />
                          {store.discount > 0 && (
                            <span className="text-xs text-emerald-400 block">
                              -%{store.discount}
                            </span>
                          )}
                          <a
                            href={store.dealUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-accent mt-1 hover:underline"
                          >
                            Mağaza <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
