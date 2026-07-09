"use client";

import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from "react";
import { X, Bell, TrendingDown } from "lucide-react";
import Link from "next/link";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "alert" | "deal";
  href?: string;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 8000);
  }, []);

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-2xl animate-in slide-in-from-right"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              {toast.type === "alert" ? (
                <Bell className="w-4 h-4 text-accent" />
              ) : (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{toast.title}</p>
              <p className="text-xs text-muted mt-0.5">{toast.message}</p>
              {toast.href && (
                <Link
                  href={toast.href}
                  className="text-xs text-accent hover:underline mt-1 inline-block"
                >
                  Görüntüle →
                </Link>
              )}
            </div>
            <button
              onClick={() => remove(toast.id)}
              className="p-1 rounded hover:bg-card-hover text-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function AlertChecker() {
  const { addToast } = useToast();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/alerts/check");
        if (!res.ok) return;
        const data = await res.json();
        for (const alert of data.triggered || []) {
          addToast({
            type: "alert",
            title: "Fiyat Alarmı Tetiklendi!",
            message: `${alert.gameTitle} hedef fiyata ulaştı.`,
            href: `/game/${alert.cheapSharkGameId}`,
          });
        }
      } catch {}
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [addToast]);

  return null;
}
