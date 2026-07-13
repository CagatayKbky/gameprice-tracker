import { SearchResult } from "@/types";
import { GameCard } from "./GameCard";
import { GameGrid } from "@/components/layout/GameGrid";

interface SimilarGamesProps {
  games: SearchResult[];
  title?: string;
}

export function SimilarGames({ games, title = "Benzer Oyunlar" }: SimilarGamesProps) {
  if (!games.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <GameGrid dense>
        {games.map((game) => (
          <GameCard key={game.gameId} game={game} />
        ))}
      </GameGrid>
    </section>
  );
}
