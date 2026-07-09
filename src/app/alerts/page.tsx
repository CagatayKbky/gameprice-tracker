"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { PriceAlertData } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AlertsPage() {
  const { t } = useLocale();
  const [alerts, setAlerts] = useState<PriceAlertData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  const removeAlert = async (id: string) => {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const activeCount = alerts.filter((a) => a.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("alerts.title")}</h1>
          <p className="text-muted mt-1">
            {t("alerts.subtitle").replace("{count}", String(activeCount))}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-lg text-muted">{t("alerts.empty")}</p>
          <p className="text-sm text-muted mt-2">
            {t("alerts.emptyHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                alert.isActive
                  ? "bg-card border-border"
                  : "bg-card/50 border-border/50 opacity-75"
              }`}
            >
              <div className="flex items-center gap-3">
                {!alert.isActive ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Bell className="w-5 h-5 text-accent shrink-0" />
                )}
                <div>
                  <Link
                    href={`/game/${alert.cheapSharkGameId}`}
                    className="font-medium hover:text-accent transition-colors"
                  >
                    {alert.gameTitle}
                  </Link>
                  <p className="text-sm text-muted mt-1">
                    {t("alerts.target")}: <PriceDisplay amount={alert.targetPrice} />
                    {alert.currentPrice != null && (
                      <>
                        {" "}· {t("alerts.current")}: <PriceDisplay amount={alert.currentPrice} />
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    alert.isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-muted/10 text-muted"
                  }`}
                >
                  {alert.isActive ? t("alerts.active") : t("alerts.triggered")}
                </span>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
