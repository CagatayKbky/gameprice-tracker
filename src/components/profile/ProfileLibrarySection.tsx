"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Library, Loader2, RefreshCw } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { invalidateOwnedCache } from "@/hooks/useOwnedGames";
import { getSteamAppHeaderUrl } from "@/lib/api/steam-profile";

interface LibraryGame {
  steamAppId: string;
  name: string | null;
  playtimeMinutes: number;
}

export function ProfileLibrarySection({ steamConnected }: { steamConnected: boolean }) {
  const { t } = useLocale();
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = () => {
    fetch("/api/steam/library")
      .then((r) => r.json())
      .then((d) => {
        setCount(d.count || 0);
        setGames(d.topPlayed || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (steamConnected) load();
    else setLoading(false);
  }, [steamConnected]);

  if (!steamConnected) return null;

  const sync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/steam/library", { method: "POST" });
      if (res.ok) {
        invalidateOwnedCache();
        load();
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Library className="w-5 h-5 text-[#66c0f4]" />
          {t("profile.libraryTitle")}
          {count > 0 && <span className="text-sm text-muted font-normal">({count})</span>}
        </h2>
        <div className="flex items-center gap-3">
          {count > 0 && (
            <Link
              href="/profile/library"
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              {t("profile.libraryViewAll")}
            </Link>
          )}
          <button
            onClick={sync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline disabled:opacity-50"
          >
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {t("profile.librarySync")}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="h-24 rounded-xl bg-card border border-border animate-pulse" />
      ) : games.length === 0 ? (
        <p className="text-sm text-muted rounded-xl border border-dashed border-border p-6 text-center">
          {t("profile.libraryEmpty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {games.map((g) => (
            <Link
              key={g.steamAppId}
              href={`/game/steam-${g.steamAppId}`}
              className="flex gap-3 rounded-xl border border-border bg-card p-2 hover:border-accent/30 transition-colors"
            >
              <div className="relative w-16 h-9 rounded overflow-hidden shrink-0 bg-background">
                <Image
                  src={getSteamAppHeaderUrl(g.steamAppId)}
                  alt={g.name || ""}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium line-clamp-2">{g.name}</p>
                <p className="text-[10px] text-muted mt-0.5">
                  {Math.round(g.playtimeMinutes / 60)}s oynanmış
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
