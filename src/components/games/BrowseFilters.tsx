"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

const PLATFORM_FILTERS = [
  { id: "", labelKey: "deals.tabs.allStores" },
  { id: "steam", label: "Steam" },
  { id: "epic", label: "Epic" },
  { id: "gog", label: "GOG" },
  { id: "ps5", label: "PS5" },
  { id: "xbox-series", label: "Xbox" },
  { id: "switch", label: "Switch" },
];

export function BrowseFilters() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const activePlatform = params.get("platform") || "";
  const letter = params.get("letter") || "a";
  const page = params.get("page") || "1";

  const setPlatform = (platformId: string) => {
    const next = new URLSearchParams();
    next.set("letter", letter);
    if (page !== "1") next.set("page", page);
    if (platformId) next.set("platform", platformId);
    router.push(`/browse?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {PLATFORM_FILTERS.map((p) => (
        <button
          key={p.id || "all"}
          onClick={() => setPlatform(p.id)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            activePlatform === p.id
              ? "bg-accent/10 text-accent border border-accent/30"
              : "bg-card border border-border hover:border-accent/30"
          )}
        >
          {"labelKey" in p && p.labelKey ? t(p.labelKey) : p.label}
        </button>
      ))}
    </div>
  );
}
