"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

function formatRemaining(
  ms: number,
  endingSoon: string,
  locale: string
) {
  if (ms <= 0) return endingSoon;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const d = Math.floor(h / 24);
  const hrs = h % 24;
  if (locale === "en") {
    if (d > 0) return `${d}d ${hrs}h`;
    return `${hrs}h ${m}m`;
  }
  if (d > 0) return `${d}g ${hrs}s`;
  return `${hrs}s ${m}dk`;
}

export function SaleCountdown({ endAt }: { endAt?: string }) {
  const { locale, t } = useLocale();
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!endAt) {
      setRemaining(null);
      return;
    }
    const end = new Date(endAt);
    if (Number.isNaN(end.getTime()) || end.getTime() <= Date.now()) {
      setRemaining(null);
      return;
    }
    const endingSoon = t("deals.saleCountdown.endingSoon");
    const tick = () =>
      setRemaining(formatRemaining(end.getTime() - Date.now(), endingSoon, locale));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [endAt, locale, t]);

  if (!endAt || !remaining) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
      <Clock className="w-3.5 h-3.5" />
      {t("deals.saleCountdown.label")}: {remaining}
    </div>
  );
}
