"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CURRENCIES, Currency } from "@/types";
import { cn } from "@/lib/utils";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  const current = CURRENCIES.find((c) => c.code === currency);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-card-hover transition-colors"
      >
        <span>{current?.symbol}</span>
        <span className="hidden xl:inline">{currency}</span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl bg-card border border-border shadow-xl overflow-hidden">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code as Currency);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-card-hover transition-colors",
                  currency === c.code && "bg-accent/10 text-accent"
                )}
              >
                <span className="font-medium w-6">{c.symbol}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
