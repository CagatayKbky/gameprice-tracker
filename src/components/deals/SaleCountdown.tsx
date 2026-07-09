"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

/** Steam spring/summer sales often end Thursday 19:00 TR — show weekly countdown as fallback */
function getNextThursday7pm(): Date {
  const now = new Date();
  const target = new Date(now);
  const day = now.getDay();
  const daysUntilThu = (4 - day + 7) % 7 || 7;
  target.setDate(now.getDate() + daysUntilThu);
  target.setHours(19, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 7);
  return target;
}

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
    const end = endAt ? new Date(endAt) : getNextThursday7pm();
    const endingSoon = t("deals.saleCountdown.endingSoon");
    const tick = () =>
      setRemaining(formatRemaining(end.getTime() - Date.now(), endingSoon, locale));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [endAt, locale, t]);

  if (!remaining) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
      <Clock className="w-3.5 h-3.5" />
      {t("deals.saleCountdown.label")}: {remaining}
    </div>
  );
}
