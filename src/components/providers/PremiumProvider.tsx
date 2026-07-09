"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { PremiumStatus } from "@/lib/premium/access";

interface PremiumContextValue extends PremiumStatus {
  loading: boolean;
  refresh: () => Promise<void>;
  startCheckout: (interval: "monthly" | "yearly") => void;
  cancelSubscription: () => Promise<void>;
}

const defaultStatus: PremiumStatus = {
  isPro: false,
  plan: "free",
  limits: {
    wishlist: 5,
    alerts: 1,
    compare: 3,
    fastSearch: false,
    push: false,
    discord: false,
    telegram: false,
    instantAlerts: false,
  },
  usage: { wishlist: 0, alerts: 0 },
  planExpiresAt: null,
  billingConfigured: false,
};

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PremiumStatus>(defaultStatus);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/status");
      if (res.ok) setStatus(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCheckout = useCallback((interval: "monthly" | "yearly") => {
    window.location.href = `/pricing/checkout?interval=${interval}`;
  }, []);

  const cancelSubscription = useCallback(async () => {
    const res = await fetch("/api/billing/cancel", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Cancel failed");
    await refresh();
  }, [refresh]);

  return (
    <PremiumContext.Provider
      value={{ ...status, loading, refresh, startCheckout, cancelSubscription }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
}
