"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Tag, TrendingDown } from "lucide-react";
import { DiscountEvent } from "@/types";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { getDiscountColor } from "@/lib/utils";

interface DiscountHistoryProps {
  events: DiscountEvent[];
}

export function DiscountHistory({ events }: DiscountHistoryProps) {
  const { format: formatPrice } = useCurrency();

  if (!events.length) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        Henüz kayıtlı indirim geçmişi yok. Fiyat senkronizasyonu sonrası burada görünecek.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, i) => (
        <div
          key={`${event.date}-${i}`}
          className="flex items-center gap-4 p-4 rounded-xl bg-card-hover border border-border"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {format(new Date(event.date), "d MMMM yyyy", { locale: tr })}
            </p>
            <p className="text-xs text-muted">{event.platformName}</p>
          </div>

          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${getDiscountColor(event.discount)}`}>
              -%{event.discount}
            </p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-muted line-through">
                {formatPrice(event.normalPrice)}
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {formatPrice(event.price)}
              </span>
            </div>
          </div>

          <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}
