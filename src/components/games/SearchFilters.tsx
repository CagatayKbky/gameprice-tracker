"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PLATFORMS } from "@/lib/platforms";
import { DealSort } from "@/lib/api/deals";
import { RAWG_GENRES } from "@/lib/rawg-genres";
import { SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

const SORT_OPTIONS: { value: DealSort; label: string }[] = [
  { value: "Deal Rating", label: "En İyi Fırsat" },
  { value: "Savings", label: "En Yüksek İndirim" },
  { value: "Price", label: "En Düşük Fiyat" },
  { value: "Metacritic", label: "Metacritic" },
  { value: "Title", label: "İsim" },
];

const YEARS = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() - i));

interface SearchFiltersProps {
  rawgEnabled?: boolean;
}

export function SearchFilters({ rawgEnabled = false }: SearchFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLocale();
  const q = params.get("q") || "";

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/search?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-card border border-border mb-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <SlidersHorizontal className="w-4 h-4" />
        {t("search.filters")}
      </div>

      <select
        value={params.get("onSale") || ""}
        onChange={(e) => update("onSale", e.target.value)}
        className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-accent focus:outline-none"
      >
        <option value="">{t("search.allDeals")}</option>
        <option value="1">{t("search.onSaleOnly")}</option>
      </select>

      <select
        value={params.get("sort") || "Deal Rating"}
        onChange={(e) => update("sort", e.target.value)}
        className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-accent focus:outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={params.get("store") || ""}
        onChange={(e) => update("store", e.target.value)}
        className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-accent focus:outline-none"
      >
        <option value="">Tüm Mağazalar</option>
        {PLATFORMS.filter((p) => p.cheapSharkId).map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={params.get("discount") || ""}
        onChange={(e) => update("discount", e.target.value)}
        className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-accent focus:outline-none"
      >
        <option value="">Tüm İndirimler</option>
        <option value="25">%25+</option>
        <option value="50">%50+</option>
        <option value="75">%75+</option>
      </select>

      <select
        value={params.get("maxPrice") || ""}
        onChange={(e) => update("maxPrice", e.target.value)}
        className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-accent focus:outline-none"
      >
        <option value="">Fiyat Limiti Yok</option>
        <option value="5">$5 altı</option>
        <option value="10">$10 altı</option>
        <option value="20">$20 altı</option>
        <option value="30">$30 altı</option>
      </select>

      {rawgEnabled && (
        <>
          <select
            value={params.get("genre") || ""}
            onChange={(e) => update("genre", e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-accent focus:outline-none"
          >
            <option value="">{t("search.allGenres")}</option>
            {RAWG_GENRES.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.label}
              </option>
            ))}
          </select>

          <select
            value={params.get("year") || ""}
            onChange={(e) => update("year", e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-accent focus:outline-none"
          >
            <option value="">{t("search.anyYear")}</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={params.get("metacritic") || ""}
            onChange={(e) => update("metacritic", e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-accent focus:outline-none"
          >
            <option value="">{t("search.anyScore")}</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
            <option value="90">90+</option>
          </select>
        </>
      )}

      {q && (
        <span className="text-xs text-muted ml-auto">
          &quot;{q}&quot; araması
        </span>
      )}
    </div>
  );
}
