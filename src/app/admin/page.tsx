"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Database,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface AdminData {
  sync: {
    totalGames: number;
    steamDone: boolean;
    rawgDone: boolean;
    rawgEnabled: boolean;
    letters: { letter: string; count: number }[];
  };
  stats: {
    trackedGames: number;
    activeAlerts: number;
    wishlistItems: number;
    profiles: number;
  };
  env: {
    rawgEnabled: boolean;
    resendEnabled: boolean;
    pushEnabled: boolean;
    sentryEnabled?: boolean;
    meiliEnabled?: boolean;
    databaseProvider: string;
  };
  jobLogs?: {
    id: string;
    type: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
    error: string | null;
  }[];
}

export default function AdminPage() {
  const { locale, t } = useLocale();
  const numberLocale = locale === "en" ? "en-US" : "tr-TR";
  const [key, setKey] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async (adminKey: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(adminKey)}`);
      if (!res.ok) {
        setError(t("admin.invalidKey"));
        setData(null);
        return;
      }
      setData(await res.json());
      sessionStorage.setItem("gp_admin_key", adminKey);
    } catch {
      setError(t("admin.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("gp_admin_key");
    if (stored) {
      setKey(stored);
      fetchData(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAction = async (action: string, extra?: Record<string, unknown>) => {
    if (!key) return;
    setActionLoading(action);
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || t("admin.actionFailed"));
        return;
      }
      await fetchData(key);
    } catch {
      setError(t("admin.actionFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="rounded-2xl bg-card border border-border p-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold">{t("admin.title")}</h1>
          </div>
          <p className="text-sm text-muted mb-4">
            {t("admin.loginHint")}
          </p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={t("admin.keyPlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm mb-3"
          />
          <button
            onClick={() => fetchData(key)}
            disabled={loading || !key}
            className="w-full px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {t("admin.login")}
          </button>
          {error && (
            <p className="text-sm text-red-400 mt-3 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-6 h-6 text-accent" />
        <div>
          <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
          <p className="text-sm text-muted">{t("admin.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label={t("admin.stat.catalog")} value={data.sync.totalGames.toLocaleString(numberLocale)} />
        <StatCard label={t("admin.stat.tracked")} value={String(data.stats.trackedGames)} />
        <StatCard label={t("admin.stat.alerts")} value={String(data.stats.activeAlerts)} />
        <StatCard label={t("admin.stat.wishlist")} value={String(data.stats.wishlistItems)} />
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" />
          {t("admin.syncStatus")}
        </h2>
        <div className="space-y-2 text-sm">
          <StatusRow label={t("admin.sync.steam")} ok={data.sync.steamDone} />
          <StatusRow label={t("admin.sync.rawg")} ok={data.sync.rawgDone} />
          <StatusRow label={t("admin.sync.rawgApi")} ok={data.env.rawgEnabled} />
          <StatusRow label={t("admin.sync.resend")} ok={data.env.resendEnabled} />
          <StatusRow label={t("admin.sync.push")} ok={data.env.pushEnabled} />
          {data.env.sentryEnabled !== undefined && (
            <StatusRow label="Sentry" ok={data.env.sentryEnabled} />
          )}
          {data.env.meiliEnabled !== undefined && (
            <StatusRow label="Meilisearch" ok={data.env.meiliEnabled} />
          )}
          <p className="text-muted pt-2">{t("admin.database")}: {data.env.databaseProvider}</p>
        </div>
      </div>

      {data.jobLogs && data.jobLogs.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">{t("admin.jobLogs")}</h2>
          <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {data.jobLogs.map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                <span className="font-mono text-xs">{job.type}</span>
                <span className={job.status === "success" ? "text-emerald-400" : job.status === "error" ? "text-red-400" : "text-amber-400"}>
                  {job.status}
                </span>
                <span className="text-muted text-xs">{new Date(job.startedAt).toLocaleString(numberLocale)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <ActionButton
          label={t("admin.action.syncCatalog")}
          loading={actionLoading === "sync-catalog"}
          onClick={() => runAction("sync-catalog", { rawgPages: 5 })}
        />
        <ActionButton
          label={t("admin.action.syncPrices")}
          loading={actionLoading === "sync-prices"}
          onClick={() => runAction("sync-prices")}
        />
        <ActionButton
          label={t("admin.action.refresh")}
          loading={loading}
          onClick={() => fetchData(key)}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-amber-400" />
      )}
      <span>{label}</span>
    </div>
  );
}

function ActionButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      {label}
    </button>
  );
}
