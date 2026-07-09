"use client";

import { useEffect, useState } from "react";
import { PiggyBank } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

export function WishlistSavingsBanner() {
  const { t } = useLocale();
  const [data, setData] = useState<{ onSale: number; total: number; savings: number } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/wishlist/savings")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data || data.onSale === 0) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <PiggyBank className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="font-semibold">{t("wishlist.savingsTitle")}</p>
          <p className="text-sm text-muted">
            {t("wishlist.savingsDesc", {
              onSale: String(data.onSale),
              total: String(data.total),
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted">{t("wishlist.savingsAmount")}</p>
        <PriceDisplay amount={data.savings} className="text-2xl font-bold text-emerald-400" />
      </div>
    </div>
  );
}
