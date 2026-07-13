import { cn } from "@/lib/utils";

export const GAME_GRID_CLASS =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4";

export const GAME_GRID_DENSE_CLASS =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4";

interface GameGridProps {
  children: React.ReactNode;
  dense?: boolean;
  className?: string;
}

export function GameGrid({ children, dense, className }: GameGridProps) {
  return (
    <div className={cn(dense ? GAME_GRID_DENSE_CLASS : GAME_GRID_CLASS, className)}>
      {children}
    </div>
  );
}
