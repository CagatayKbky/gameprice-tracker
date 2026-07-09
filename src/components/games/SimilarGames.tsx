import { SearchResult } from "@/types";
import { GameCard } from "./GameCard";

interface SimilarGamesProps {
  games: SearchResult[];
  title?: string;
}

export function SimilarGames({ games, title = "Benzer Oyunlar" }: SimilarGamesProps) {
  if (!games.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard key={game.gameId} game={game} />
        ))}
      </div>
    </section>
  );
}
