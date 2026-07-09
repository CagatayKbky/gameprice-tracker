"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function TrendingSearches() {
  const { t } = useLocale();
  const [items, setItems] = useState<{ query: string; count: number }[]>([]);

  useEffect(() => {
    fetch("/api/search/trending")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold">{t("home.sections.trendingSearches")}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.query}
            href={`/search?q=${encodeURIComponent(item.query)}`}
            className="px-4 py-2 rounded-xl bg-card border border-border hover:border-accent/50 text-sm transition-colors"
          >
            {item.query}
            <span className="text-muted ml-1.5 text-xs">({item.count})</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
