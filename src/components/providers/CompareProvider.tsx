"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface CompareGame {
  gameId: string;
  title: string;
  imageUrl?: string;
}

interface CompareContextValue {
  games: CompareGame[];
  addGame: (game: CompareGame) => boolean;
  removeGame: (gameId: string) => void;
  clearAll: () => void;
  isInCompare: (gameId: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);
const STORAGE_KEY = "gp_compare";
const MAX_COMPARE = 3;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<CompareGame[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setGames(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = useCallback((next: CompareGame[]) => {
    setGames(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addGame = useCallback(
    (game: CompareGame) => {
      if (games.some((g) => g.gameId === game.gameId)) return true;
      if (games.length >= MAX_COMPARE) return false;
      persist([...games, game]);
      return true;
    },
    [games, persist]
  );

  const removeGame = useCallback(
    (gameId: string) => {
      persist(games.filter((g) => g.gameId !== gameId));
    },
    [games, persist]
  );

  const clearAll = useCallback(() => persist([]), [persist]);

  const isInCompare = useCallback(
    (gameId: string) => games.some((g) => g.gameId === gameId),
    [games]
  );

  return (
    <CompareContext.Provider
      value={{ games, addGame, removeGame, clearAll, isInCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
