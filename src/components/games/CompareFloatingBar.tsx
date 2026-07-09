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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
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
