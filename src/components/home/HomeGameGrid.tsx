"use client";

import { GameCard } from "@/components/games/GameCard";
import { SearchResult } from "@/types";
import { useLocale } from "@/components/providers/LocaleProvider";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { GameGrid } from "@/components/layout/GameGrid";

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
        <HomeSectionHeader title={title} subtitle={emptyMessage} />
      </section>
    );
  }

  if (!games.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/40">
      <HomeSectionHeader
        title={title}
        subtitle={subtitle}
        href={href}
        linkLabel={resolvedLinkLabel}
      />
      <GameGrid dense>
        {games.map((game) => (
          <GameCard key={game.gameId + game.title} game={game} />
        ))}
      </GameGrid>
    </section>
  );
}
