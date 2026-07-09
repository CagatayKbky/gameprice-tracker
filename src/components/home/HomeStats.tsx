"use client";

import { Library, Store, TrendingDown, Bell } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface HomeStatsProps {
  catalogCount: number;
  platformCount: number;
  dealCount: number;
}

export function HomeStats({ catalogCount, platformCount, dealCount }: HomeStatsProps) {
  const { locale, t } = useLocale();
  const numberLocale = locale === "en" ? "en-US" : "tr-TR";

  const stats = [
    {
      icon: Library,
      value: catalogCount.toLocaleString(numberLocale) + "+",
      label: t("home.stats.catalog"),
      color: "text-indigo-400",
    },
    {
      icon: Store,
      value: String(platformCount),
      label: t("home.stats.platforms"),
      color: "text-purple-400",
    },
    {
      icon: TrendingDown,
      value: dealCount > 0 ? dealCount + "+" : t("home.stats.dealsLive"),
      label: t("home.stats.deals"),
      color: "text-emerald-400",
    },
    {
      icon: Bell,
      value: t("home.stats.alertsFree"),
      label: t("home.stats.alerts"),
      color: "text-pink-400",
    },
  ];

  return (
    <section className="border-b border-border/50 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
              >
                <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
