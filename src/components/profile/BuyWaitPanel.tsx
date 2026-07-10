"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingCart, Timer, Eye } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { GameImage } from "@/components/ui/GameImage";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface BuyWaitItem {
  gameId: string;
  title: string;
  imageUrl?: string | null;
  price: number;
  discount: number;
  verdict: "buy" | "wait" | "watch";
  score: number;
  reasonKey: string;
  reasonParams?: Record<string, string>;
  isHistoricalLow: boolean;
}

const verdictStyle = {
  buy: {
    labelKey: "buyWait.verdict.buy",
    icon: ShoppingCart,
    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  wait: {
    labelKey: "buyWait.verdict.wait",
    icon: Timer,
    cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  watch: {
    labelKey: "buyWait.verdict.watch",
    icon: Eye,
    cls: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
} as const;

export function BuyWaitPanel({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BuyWaitItem[]>([]);
  const [summary, setSummary] = useState({ buy: 0, wait: 0, watch: 0 });

  useEffect(() => {
    fetch("/api/profile/buy-wait")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setSummary(data.summary || { buy: 0, wait: 0, watch: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-[#8f98a0]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#2a475e]/60 bg-[#1b2838]/40 px-4 py-6 text-center text-sm text-[#8f98a0]">
        {t("buyWait.empty")}
      </p>
    );
  }

  const visible = compact ? items.slice(0, 4) : items;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["buy", "watch", "wait"] as const).map((key) => (
          <span
            key={key}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${verdictStyle[key].cls}`}
          >
            {t(verdictStyle[key].labelKey)}: {summary[key]}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map((item) => {
          const style = verdictStyle[item.verdict];
          const Icon = style.icon;
          return (
            <Link
              key={item.gameId}
              href={`/game/${item.gameId}`}
              className="flex flex-col gap-2 rounded-xl border border-[#2a475e]/50 bg-[#1b2838]/60 p-3 transition-colors hover:border-[#66c0f4]/30 sm:flex-row sm:items-center sm:gap-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <GameImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-14 w-10 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{item.title}</p>
                  <p className="line-clamp-2 text-xs text-[#8f98a0] sm:line-clamp-1">
                    {t(item.reasonKey, item.reasonParams)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <PriceDisplay amount={item.price} className="text-[#66c0f4] font-medium" />
                    {item.discount > 0 && (
                      <span className="text-emerald-400">-{item.discount}%</span>
                    )}
                    {item.isHistoricalLow && (
                      <span className="text-amber-300">{t("buyWait.historicalLow")}</span>
                    )}
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex w-fit shrink-0 items-center gap-1 self-start rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase sm:self-center ${style.cls}`}
              >
                <Icon className="h-3 w-3" />
                {t(style.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
