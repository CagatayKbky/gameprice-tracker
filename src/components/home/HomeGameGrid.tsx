"use client";

import { GameCard } from "@/components/games/GameCard";
import { SearchResult } from "@/types";
import { useLocale } from "@/components/providers/LocaleProvider";
import { HomeSectionHeader } from "./HomeSectionHeader";

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
        {games.map((game) => (
          <GameCard key={game.gameId + game.title} game={game} />
        ))}
      </div>
    </section>
  );
}
