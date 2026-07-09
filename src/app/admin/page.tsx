"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Shield,
  Database,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Crown,
  UserCog,
} from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface AdminUser {
  sessionId: string;
  email: string | null;
  name: string | null;
  steamId: string | null;
  steamPersona: string | null;
  steamAvatar: string | null;
  isAdmin: boolean;
  plan: string;
  planExpiresAt: string | null;
}

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
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

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
      if (userQuery.trim()) {
        await searchUsers(userQuery);
      }
      return result;
    } catch {
      setError(t("admin.actionFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  const searchUsers = async (query: string) => {
    if (!key || !query.trim()) {
      setUsers([]);
      return;
    }
    setUserSearchLoading(true);
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search-users", query }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || t("admin.actionFailed"));
        return;
      }
      setUsers(result.users || []);
    } catch {
      setError(t("admin.actionFailed"));
    } finally {
      setUserSearchLoading(false);
    }
  };

  const setUserAccess = async (
    user: AdminUser,
    access: { isAdmin?: boolean; isPro?: boolean }
  ) => {
    const actionKey =
      access.isAdmin !== undefined
        ? `user-access:${user.sessionId}:admin:${access.isAdmin}`
        : `user-access:${user.sessionId}:pro:${access.isPro}`;
    setActionLoading(actionKey);
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set-user-access",
          identifier: user.sessionId,
          identifierType: "sessionId",
          ...access,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || t("admin.actionFailed"));
        return;
      }
      await searchUsers(userQuery);
    } catch {
      setError(t("admin.actionFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  const grantCosmetic = async (user: AdminUser, type: "badge" | "frame", key: string) => {
    const actionKey = `grant-cosmetic:${user.sessionId}:${type}:${key}`;
    setActionLoading(actionKey);
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant-cosmetic",
          sessionId: user.sessionId,
          type,
          key,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || t("admin.actionFailed"));
        return;
      }
      await searchUsers(userQuery);
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

      <div className="flex flex-wrap gap-3 mb-8">
        <ActionButton
          label={t("admin.action.syncCatalog")}
          loading={actionLoading === "sync-catalog"}
          onClick={() => runAction("sync-catalog", { rawgPages: 5 })}
        />
        <ActionButton
          label={t("admin.action.syncMeili")}
          loading={actionLoading === "sync-meilisearch"}
          onClick={() => runAction("sync-meilisearch")}
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
        <ActionButton
          label={t("admin.action.makeMeAdmin")}
          loading={actionLoading === "make-me-admin"}
          onClick={() => runAction("make-me-admin")}
        />
        <ActionButton
          label={t("admin.action.makeMePro")}
          loading={actionLoading === "make-me-pro"}
          onClick={() => runAction("make-me-pro")}
        />
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-2">
          <UserCog className="w-4 h-4 text-accent" />
          <h2 className="font-semibold">{t("admin.users.title")}</h2>
        </div>
        <p className="text-sm text-muted mb-4">{t("admin.users.subtitle")}</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void searchUsers(userQuery)}
              placeholder={t("admin.users.search")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={() => void searchUsers(userQuery)}
            disabled={userSearchLoading || !userQuery.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
          >
            {userSearchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {t("admin.users.searchButton")}
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-sm text-muted">{t("admin.users.noResults")}</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const displayName = user.steamPersona || user.name || user.email || user.sessionId.slice(0, 8);
              const isPro = user.plan === "pro";
              return (
                <div key={user.sessionId} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {user.steamAvatar ? (
                        <Image
                          src={user.steamAvatar}
                          alt={displayName}
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-accent/10" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{displayName}</p>
                        <p className="text-xs text-muted truncate">
                          {user.email || user.steamId || user.sessionId}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full border border-border">
                            {t("admin.users.plan")}: {user.plan}
                          </span>
                          <span className="px-2 py-0.5 rounded-full border border-border">
                            {t("admin.users.admin")}: {user.isAdmin ? t("admin.users.yes") : t("admin.users.no")}
                          </span>
                          {isPro && <Crown className="w-4 h-4 text-amber-300" />}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <MiniAction
                        label={user.isAdmin ? t("admin.users.revokeAdmin") : t("admin.users.grantAdmin")}
                        loading={actionLoading === `user-access:${user.sessionId}:admin:${!user.isAdmin}`}
                        onClick={() => void setUserAccess(user, { isAdmin: !user.isAdmin })}
                      />
                      <MiniAction
                        label={isPro ? t("admin.users.revokePro") : t("admin.users.grantPro")}
                        loading={actionLoading === `user-access:${user.sessionId}:pro:${!isPro}`}
                        onClick={() => void setUserAccess(user, { isPro: !isPro })}
                      />
                      <MiniAction
                        label={t("admin.users.grantFounder")}
                        loading={actionLoading === `grant-cosmetic:${user.sessionId}:badge:founder`}
                        onClick={() => void grantCosmetic(user, "badge", "founder")}
                      />
                      <MiniAction
                        label={t("admin.users.grantProGold")}
                        loading={actionLoading === `grant-cosmetic:${user.sessionId}:frame:pro-gold`}
                        onClick={() => void grantCosmetic(user, "frame", "pro-gold")}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

function MiniAction({
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
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:border-accent/30 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {label}
    </button>
  );
}
