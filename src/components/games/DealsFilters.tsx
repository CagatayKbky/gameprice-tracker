"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PLATFORMS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

const TABS = [
  { id: "all", labelKey: "deals.tabs.all" },
  { id: "free", labelKey: "deals.tabs.free" },
  { id: "mega", labelKey: "deals.tabs.mega" },
  { id: "historical-low", labelKey: "deals.tabs.historicalLow" },
  { id: "under10", labelKey: "deals.tabs.under10" },
  { id: "aaa", labelKey: "deals.tabs.aaa" },
];

export function DealsFilters() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const activeTab = params.get("tab") || "all";
  const activeStore = params.get("store") || "";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/deals?${next.toString()}`);
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setParam("tab", tab.id === "all" ? "" : tab.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              (tab.id === "all" && !params.get("tab")) || activeTab === tab.id
                ? "bg-accent text-white"
                : "bg-card border border-border hover:border-accent/30"
            )}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setParam("store", "")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            !activeStore
              ? "bg-accent/10 text-accent border border-accent/30"
              : "bg-card border border-border hover:border-accent/30"
          )}
        >
          {t("deals.tabs.allStores")}
        </button>
        {PLATFORMS.filter((p) => p.cheapSharkId).map((p) => (
          <button
            key={p.id}
            onClick={() => setParam("store", p.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeStore === p.id
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-card border border-border hover:border-accent/30"
            )}
          >
            {p.shortName}
          </button>
        ))}
      </div>
    </div>
  );
}
