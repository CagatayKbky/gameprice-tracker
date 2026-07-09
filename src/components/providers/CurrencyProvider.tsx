"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Currency, CURRENCIES, DEFAULT_CURRENCY } from "@/types";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Record<Currency, number>;
  convert: (usdAmount: number) => number;
  format: (usdAmount: number) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "gp_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<Currency, number>>({
    USD: 1,
    EUR: 0.92,
    TRY: 34.5,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
    if (stored && CURRENCIES.some((c) => c.code === stored)) {
      setCurrencyState(stored);
    }

    fetch("/api/currency")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) setRates(data.rates);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }, []);

  const convert = useCallback(
    (usdAmount: number) => {
      const rate = rates[currency] ?? 1;
      return Math.round(usdAmount * rate * 100) / 100;
    },
    [currency, rates]
  );

  const format = useCallback(
    (usdAmount: number) => {
      const converted = convert(usdAmount);
      return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "TRY" ? 0 : 2,
        maximumFractionDigits: currency === "TRY" ? 0 : 2,
      }).format(converted);
    },
    [currency, convert]
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, rates, convert, format, isLoading }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
