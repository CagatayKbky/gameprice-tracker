"use client";

import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { useCompare } from "@/components/providers/CompareProvider";
import { useLocale } from "@/components/providers/LocaleProvider";

export function CompareFloatingBar() {
  const { games } = useCompare();
  const { t } = useLocale();

  if (games.length === 0) return null;

  return (
    <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.75rem)] left-1/2 -translate-x-1/2 z-50 md:bottom-4 md:z-40 max-w-[calc(100vw-2rem)]">
      <Link
        href="/compare"
        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-accent text-white shadow-2xl shadow-accent/30 hover:bg-accent-hover transition-colors font-medium text-sm"
      >
        <GitCompareArrows className="w-4 h-4" />
        {t("compare.add")} ({games.length}/3)
      </Link>
    </div>
  );
}
