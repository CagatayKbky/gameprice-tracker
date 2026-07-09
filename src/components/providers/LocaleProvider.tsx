"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Locale, LOCALES, t as translate } from "@/lib/i18n/translations";

const LOCALE_KEY = "gameprice-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  locales: typeof LOCALES;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (stored === "tr" || stored === "en") setLocaleState(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    localStorage.setItem(LOCALE_KEY, locale);
    document.cookie = `${LOCALE_KEY}=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }, [locale, mounted]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, locales: LOCALES }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: "tr" as Locale,
      setLocale: () => {},
      t: (key: string, params?: Record<string, string | number>) => translate("tr", key, params),
      locales: LOCALES,
    };
  }
  return ctx;
}
