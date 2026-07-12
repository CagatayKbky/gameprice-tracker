"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import type { BundleDeal } from "@/types";

export function BundleComparePanel({ bundles }: { bundles: BundleDeal[] }) {
  const { t } = useLocale();
  const [selected, setSelected] = useState<string[]>([]);

  const selectedBundles = useMemo(
    () => bundles.filter((b) => selected.includes(b.gameId + b.dealUrl)),
    [bundles, selected]
  );

  const toggle = (key: string) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((id) => id !== key);
      if (prev.length >= 4) return prev;
      return [...prev, key];
    });
  };

  if (bundles.length < 2) return null;

  return (
    <section className="mb-8 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <GitCompareArrows className="w-5 h-5 text-purple-400" />
        <h2 className="font-semibold">{t("bundles.compareTitle")}</h2>
      </div>
      <p className="text-sm text-muted mb-4">{t("bundles.compareHint")}</p>

      {selectedBundles.length >= 2 && (
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse min-w-[480px]">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="py-2 pr-3">{t("bundles.compareBundle")}</th>
                <th className="py-2 pr-3">{t("bundles.comparePrice")}</th>
                <th className="py-2 pr-3">{t("bundles.compareDiscount")}</th>
                <th className="py-2 pr-3">{t("bundles.comparePerGame")}</th>
                <th className="py-2">{t("bundles.compareStore")}</th>
              </tr>
            </thead>
            <tbody>
              {selectedBundles.map((bundle) => (
                <tr key={bundle.gameId + bundle.dealUrl} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-medium line-clamp-2 max-w-[200px]">{bundle.title}</td>
                  <td className="py-2 pr-3">
                    <PriceDisplay amount={bundle.salePrice} className="font-semibold text-emerald-400" />
                  </td>
                  <td className="py-2 pr-3">-%{bundle.discount}</td>
                  <td className="py-2 pr-3">
                    {bundle.pricePerGame != null ? (
                      <PriceDisplay amount={bundle.pricePerGame} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2">{bundle.store}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {bundles.slice(0, 12).map((bundle) => {
          const key = bundle.gameId + bundle.dealUrl;
          const active = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? "border-purple-400 bg-purple-500/20 text-purple-200"
                  : "border-border text-muted hover:border-purple-400/40"
              }`}
            >
              {bundle.title.slice(0, 40)}
              {bundle.title.length > 40 ? "…" : ""}
            </button>
          );
        })}
      </div>

      {selectedBundles.length === 1 && (
        <p className="text-xs text-muted mt-3">{t("bundles.compareNeedMore")}</p>
      )}

      {selectedBundles.length > 0 && (
        <div className="mt-3 flex gap-3">
          {selectedBundles.map((bundle) => (
            <Link
              key={bundle.gameId + bundle.dealUrl}
              href={`/game/${bundle.gameId}`}
              className="text-xs text-accent hover:underline"
            >
              {bundle.title.slice(0, 28)}…
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
