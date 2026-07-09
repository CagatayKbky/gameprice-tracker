"use client";

import { ExternalLink, TrendingDown } from "lucide-react";
import { StorePrice } from "@/types";
import { getDiscountColor } from "@/lib/utils";
import { PlatformBadge } from "./PlatformBadge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { wrapAffiliateUrl } from "@/lib/affiliate";

interface StoreComparisonProps {
  stores: StorePrice[];
  cheapestPlatformId?: string;
}

export function StoreComparison({ stores, cheapestPlatformId }: StoreComparisonProps) {
  if (!stores.length) {
    return (
      <div className="text-center py-8 text-muted">
        Bu oyun için mağaza fiyatı bulunamadı
      </div>
    );
  }

  const cheapest = cheapestPlatformId || stores[0]?.platformId;

  return (
    <div className="space-y-2">
      {stores.map((store, index) => {
        const isCheapest = store.platformId === cheapest;
        return (
          <a
            key={store.platformId}
            href={wrapAffiliateUrl(store.dealUrl, store.platformId)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${
              isCheapest
                ? "bg-emerald-500/10 border-emerald-500/30 glow-accent"
                : "bg-card border-border hover:border-accent/30"
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-lg font-bold text-muted w-6">
                {index + 1}
              </span>
              <PlatformBadge platformId={store.platformId} />
              {isCheapest && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <TrendingDown className="w-3 h-3" />
                  En Ucuz
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {store.discount > 0 && (
                <span
                  className={`text-sm font-bold ${getDiscountColor(store.discount)}`}
                >
                  -%{store.discount}
                </span>
              )}
              <div className="text-right">
                {store.discount > 0 && (
                  <PriceDisplay
                    amount={store.normalPrice}
                    className="text-xs text-muted line-through block"
                  />
                )}
                <PriceDisplay
                  amount={store.price}
                  className={`text-lg font-bold block ${
                    isCheapest ? "text-emerald-400" : "text-foreground"
                  }`}
                />
              </div>
              <ExternalLink className="w-4 h-4 text-muted" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
