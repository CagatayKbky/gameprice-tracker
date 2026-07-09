"use client";

import { ExternalLink, Search, CheckCircle2 } from "lucide-react";
import { PlatformMatrixItem } from "@/types";
import { PlatformBadge } from "./PlatformBadge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface PlatformMatrixProps {
  items: PlatformMatrixItem[];
}

export function PlatformMatrix({ items }: PlatformMatrixProps) {
  const priced = items.filter((i) => i.status === "priced");
  const searchOnly = items.filter((i) => i.status === "search");

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Tüm Platformlar</h2>
        <span className="text-sm text-muted">
          {priced.length}/{items.length} platformda fiyat mevcut
        </span>
      </div>

      {priced.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Fiyatı Bilinen Platformlar
          </h3>
          <div className="space-y-2">
            {priced.map((item) => (
              <PlatformRow key={item.platformId} item={item} />
            ))}
          </div>
        </div>
      )}

      {searchOnly.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted mb-3 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Mağazada Ara (fiyat henüz çekilemedi)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {searchOnly.map((item) => (
              <PlatformRow key={item.platformId} item={item} compact />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PlatformRow({
  item,
  compact,
}: {
  item: PlatformMatrixItem;
  compact?: boolean;
}) {
  return (
    <a
      href={item.dealUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] ${
        item.status === "priced"
          ? "bg-card border-border hover:border-accent/30"
          : "bg-card/50 border-border/50 hover:border-accent/20"
      } ${compact ? "text-sm" : ""}`}
    >
      <PlatformBadge platformId={item.platformId} size="sm" />
      <div className="flex-1 min-w-0" />
      {item.status === "priced" ? (
        <div className="text-right shrink-0">
          {item.discount > 0 && (
            <span className="text-xs text-emerald-400 font-bold block">
              -%{item.discount}
            </span>
          )}
          <PriceDisplay amount={item.price} className="font-bold text-emerald-400" />
        </div>
      ) : (
        <span className="text-xs text-muted flex items-center gap-1 shrink-0">
          Mağazada ara
          <ExternalLink className="w-3 h-3" />
        </span>
      )}
    </a>
  );
}
