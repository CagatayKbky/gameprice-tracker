"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { usePremium } from "@/components/providers/PremiumProvider";

export interface CompareGame {
  gameId: string;
  title: string;
  imageUrl?: string;
}

interface CompareContextValue {
  games: CompareGame[];
  maxCompare: number;
  addGame: (game: CompareGame) => boolean;
  removeGame: (gameId: string) => void;
  clearAll: () => void;
  isInCompare: (gameId: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);
const STORAGE_KEY = "gp_compare";

export function CompareProvider({ children }: { children: ReactNode }) {
  const { limits } = usePremium();
  const maxCompare = limits.compare;
  const [games, setGames] = useState<CompareGame[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CompareGame[];
        setGames(parsed.slice(0, maxCompare));
      }
    } catch {}
  }, [maxCompare]);

  const persist = useCallback(
    (next: CompareGame[]) => {
      const trimmed = next.slice(0, maxCompare);
      setGames(trimmed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    },
    [maxCompare]
  );

  const addGame = useCallback(
    (game: CompareGame) => {
      if (games.some((g) => g.gameId === game.gameId)) return true;
      if (games.length >= maxCompare) return false;
      persist([...games, game]);
      return true;
    },
    [games, maxCompare, persist]
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
      value={{ games, maxCompare, addGame, removeGame, clearAll, isInCompare }}
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
