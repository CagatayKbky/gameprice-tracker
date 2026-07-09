"use client";

import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";
import { useRecentlyViewed } from "@/components/providers/RecentlyViewedProvider";
import { GameImage } from "@/components/ui/GameImage";
import { resolveGameImage } from "@/lib/game-images";
import { useLocale } from "@/components/providers/LocaleProvider";

export function RecentlyViewedSection() {
  const { t } = useLocale();
  const { games, clearAll } = useRecentlyViewed();

  if (games.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          <div>
            <h2 className="text-xl font-bold">{t("home.sections.recentlyViewed")}</h2>
          </div>
        </div>
        <button
          onClick={clearAll}
          className="text-xs text-muted hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t("compare.clear")}
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {games.map((game) => {
          const image = resolveGameImage({
            imageUrl: game.imageUrl,
            steamAppId: game.steamAppId,
          });
          return (
            <Link
              key={game.gameId}
              href={`/game/${game.gameId}`}
              className="shrink-0 w-28 group"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-card border border-border group-hover:border-accent/50 transition-colors">
                <GameImage
                  src={image}
                  alt={game.title}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <p className="text-xs mt-1.5 line-clamp-2 group-hover:text-accent transition-colors">
                {game.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
