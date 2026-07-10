"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Gamepad2, Loader2, Library, Archive } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface InsightsData {
  totalGames: number;
  totalPlaytimeHours: number;
  unplayedCount: number;
  staleBacklogCount: number;
  backlogScore: number;
  topUnplayed: Array<{ steamAppId: string; name: string | null }>;
}

export function LibraryInsightsPanel({ steamConnected }: { steamConnected: boolean }) {
  const { t } = useLocale();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!steamConnected) {
      setLoading(false);
      return;
    }
    fetch("/api/steam/library?insights=1")
      .then((r) => r.json())
      .then((json) => setData(json.insights || null))
      .finally(() => setLoading(false));
  }, [steamConnected]);

  if (!steamConnected) return null;

  if (loading) {
    return (
      <div className="mb-8 flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-[#66c0f4]" />
      </div>
    );
  }

  if (!data || data.totalGames === 0) return null;

  const cards = [
    {
      icon: Library,
      label: t("libraryInsights.totalGames"),
      value: String(data.totalGames),
      color: "text-[#66c0f4]",
    },
    {
      icon: Clock,
      label: t("libraryInsights.playtime"),
      value: t("libraryInsights.hours", { count: String(data.totalPlaytimeHours) }),
      color: "text-emerald-400",
    },
    {
      icon: Gamepad2,
      label: t("libraryInsights.unplayed"),
      value: String(data.unplayedCount),
      color: "text-pink-400",
    },
    {
      icon: Archive,
      label: t("libraryInsights.backlog"),
      value: `${data.backlogScore}%`,
      color: "text-amber-300",
    },
  ];

  return (
    <section className="mb-8 rounded-2xl border border-[#2a475e]/50 bg-[#0e1419] p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-semibold text-white">{t("libraryInsights.title")}</h2>
          <p className="text-sm text-[#8f98a0]">{t("libraryInsights.subtitle")}</p>
        </div>
        <Link href="/profile/library" className="shrink-0 text-sm text-[#66c0f4] hover:underline">
          {t("libraryInsights.viewLibrary")}
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[#2a475e]/50 bg-[#1b2838]/60 p-4"
          >
            <card.icon className={`mb-2 h-4 w-4 ${card.color}`} />
            <p className="text-xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-[#8f98a0]">{card.label}</p>
          </div>
        ))}
      </div>

      {data.staleBacklogCount > 0 && (
        <p className="mb-3 text-sm text-[#8f98a0]">
          {t("libraryInsights.stale", { count: String(data.staleBacklogCount) })}
        </p>
      )}

      {data.topUnplayed.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8f98a0]">
            {t("libraryInsights.topUnplayed")}
          </p>
          <div className="flex flex-wrap gap-2">
            {data.topUnplayed.map((game) => (
              <span
                key={game.steamAppId}
                className="rounded-full border border-[#2a475e]/60 bg-[#1b2838] px-3 py-1 text-xs text-white"
              >
                {game.name || `App ${game.steamAppId}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
