"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GameCard } from "@/components/games/GameCard";
import { SearchResult } from "@/types";
import { useLocale } from "@/components/providers/LocaleProvider";

interface HomeSectionProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  games: SearchResult[];
  emptyMessage?: string;
}

export function HomeGameGrid({
  title,
  subtitle,
  href,
  linkLabel,
  games,
  emptyMessage,
}: HomeSectionProps) {
  const { t } = useLocale();
  const resolvedLinkLabel = linkLabel ?? t("common.seeAll");

  if (!games.length && emptyMessage) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-muted">{emptyMessage}</p>
      </section>
    );
  }

  if (!games.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="text-sm text-accent hover:underline flex items-center gap-1 shrink-0"
          >
            {resolvedLinkLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
        {games.map((game) => (
          <GameCard key={game.gameId + game.title} game={game} />
        ))}
      </div>
    </section>
  );
}
