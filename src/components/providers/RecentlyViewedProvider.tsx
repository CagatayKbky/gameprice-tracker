"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface RecentGame {
  gameId: string;
  title: string;
  imageUrl?: string;
  steamAppId?: string;
  viewedAt: string;
}

interface RecentlyViewedContextValue {
  games: RecentGame[];
  addGame: (game: Omit<RecentGame, "viewedAt">) => void;
  clearAll: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);
const STORAGE_KEY = "gp_recent";
const MAX_RECENT = 12;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<RecentGame[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setGames(JSON.parse(stored));
    } catch {}
  }, []);

  const addGame = useCallback((game: Omit<RecentGame, "viewedAt">) => {
    setGames((prev) => {
      const filtered = prev.filter((g) => g.gameId !== game.gameId);
      const next = [
        { ...game, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setGames([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ games, addGame, clearAll }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}
