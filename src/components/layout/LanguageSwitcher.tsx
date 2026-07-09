"use client";

import { Globe } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale, locales } = useLocale();

  return (
    <div className="relative group">
      <button
        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors flex items-center gap-1"
        aria-label="Language"
      >
        <Globe className="w-4 h-4 shrink-0" />
        <span className="text-xs font-medium uppercase hidden xl:inline">{locale}</span>
      </button>
      <div className="absolute right-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
        <div className="bg-card border border-border rounded-xl shadow-xl py-1 min-w-[120px]">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code as Locale)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-card-hover transition-colors ${
                locale === l.code ? "text-accent font-medium" : "text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
