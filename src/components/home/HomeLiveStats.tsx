"use client";

import { useEffect, useState } from "react";
import { TrendingDown, Percent, Tag } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { fetchJson } from "@/lib/fetch-json";

export interface HomeLiveStatsData {
  dealCount: number;
  maxDiscount: number;
  freeCount: number;
}

interface HomeLiveStatsProps {
  initialStats?: HomeLiveStatsData;
}

export function HomeLiveStats({ initialStats }: HomeLiveStatsProps) {
  const { t } = useLocale();
  const [stats, setStats] = useState<HomeLiveStatsData | null>(initialStats ?? null);

  useEffect(() => {
    if (initialStats) return;
    fetchJson<HomeLiveStatsData>("/api/home/live-stats", 10_000)
      .then(setStats)
      .catch(() => {});
  }, [initialStats]);

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card/90 backdrop-blur border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.dealCount}</p>
            <p className="text-xs text-muted">{t("home.liveStats.deals")}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-card/90 backdrop-blur border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <Percent className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">%{stats.maxDiscount}</p>
            <p className="text-xs text-muted">{t("home.liveStats.maxDiscount")}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-card/90 backdrop-blur border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <Tag className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.freeCount}</p>
            <p className="text-xs text-muted">{t("home.liveStats.free")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
