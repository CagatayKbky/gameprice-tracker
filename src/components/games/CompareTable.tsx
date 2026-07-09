"use client";

import Link from "next/link";
import { GameDeal } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GameImage } from "@/components/ui/GameImage";
import { PlatformBadge } from "./PlatformBadge";
import { ExternalLink } from "lucide-react";

interface CompareTableProps {
  games: GameDeal[];
}

export function CompareTable({ games }: CompareTableProps) {
  const rows = [
    { label: "En Ucuz Fiyat", key: "cheapest" },
    { label: "En Düşük", key: "currentLow" },
    { label: "Tarihi En Düşük", key: "historicalLow" },
    { label: "Mağaza Sayısı", key: "storeCount" },
    { label: "Metacritic", key: "metacritic" },
  ];

  const allPlatforms = Array.from(
    new Set(games.flatMap((g) => g.stores.map((s) => s.platformId)))
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr>
            <th className="p-4 text-left text-sm text-muted w-40" />
            {games.map((game) => (
              <th key={game.gameId} className="p-4 text-center align-top">
                <Link href={`/game/${game.gameId}`} className="group">
                  <div className="relative w-28 h-36 mx-auto rounded-xl overflow-hidden bg-card-hover mb-3">
                    <GameImage
                      src={game.imageUrl}
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
            ))}
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
                    <PriceDisplay
                      amount={game.historicalLow}
                      className="font-bold"
                    />
                  )}
                  {row.key === "storeCount" && (
                    <span className="text-xl font-bold">{game.stores.length}</span>
                  )}
                  {row.key === "metacritic" && (
                    <span className="text-xl font-bold">
                      {game.metacritic || "—"}
                    </span>
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
  );
}
