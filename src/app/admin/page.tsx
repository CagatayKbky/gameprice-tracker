"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
  LogIn,
} from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

interface AdminUser {
  sessionId: string;
  email: string | null;
  name: string | null;
  steamId: string | null;
  steamPersona: string | null;
  steamAvatar: string | null;
  googleId: string | null;
  googleAvatar: string | null;
  isAdmin: boolean;
  plan: string;
  planExpiresAt: string | null;
  createdAt?: string;
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
    proUsers?: number;
    notifications7d?: number;
    referrals?: number;
    googleUsers?: number;
  };
  env: {
    rawgEnabled: boolean;
    resendEnabled: boolean;
    pushEnabled: boolean;
    sentryEnabled?: boolean;
    meiliEnabled?: boolean;
    databaseProvider: string;
  };
  users?: AdminUser[];
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
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [googleUsers, setGoogleUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [profile, setProfile] = useState<{
    googleId?: string | null;
    name?: string | null;
    googleAvatar?: string | null;
  }>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sessionRes, adminRes, googleRes] = await Promise.all([
        fetch("/api/admin/session"),
        fetch("/api/admin"),
        fetch("/api/admin?google=1"),
      ]);

      if (sessionRes.status === 403 || sessionRes.status === 401) {
        setAuthorized(false);
        const prof = await fetch("/api/profile").then((r) => r.json()).catch(() => ({}));
        setProfile(prof);
        setData(null);
        return;
      }

      if (!adminRes.ok) {
        setError(t("admin.connectionError"));
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
      setData(await adminRes.json());
      const googleData = await googleRes.json();
      setGoogleUsers(googleData.users || []);
    } catch {
      setError(t("admin.connectionError"));
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const runAction = async (action: string, extra?: Record<string, unknown>) => {
    setActionLoading(action);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || t("admin.actionFailed"));
        return;
      }
      await fetchData();
      if (userQuery.trim()) {
        await searchUsers(userQuery);
      }
    } catch {
      setError(t("admin.actionFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  const searchUsers = async (query: string) => {
    setUserSearchLoading(true);
    try {
      const res = await fetch(`/api/admin?users=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } finally {
      setUserSearchLoading(false);
    }
  };

  const setUserAccess = async (
    user: AdminUser,
    access: { isAdmin?: boolean; isPro?: boolean }
  ) => {
    setActionLoading(
      access.isAdmin !== undefined
        ? `user-access:${user.sessionId}:admin:${access.isAdmin}`
        : `user-access:${user.sessionId}:pro:${access.isPro}`
    );
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set-user-access",
          identifier: user.sessionId,
          identifierType: "sessionId",
          ...access,
        }),
      });
      if (!res.ok) {
        setError(t("admin.actionFailed"));
        return;
      }
      await fetchData();
      await searchUsers(userQuery);
    } finally {
      setActionLoading(null);
    }
  };

  const grantCosmetic = async (
    user: AdminUser,
    type: "badge" | "frame" | "effect",
    key: string
  ) => {
    setActionLoading(`grant-cosmetic:${user.sessionId}:${type}:${key}`);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant-cosmetic",
          sessionId: user.sessionId,
          type,
          key,
        }),
      });
      if (!res.ok) {
        setError(t("admin.actionFailed"));
        return;
      }
      await searchUsers(userQuery);
    } finally {
      setActionLoading(null);
    }
  };

  if (authorized === null || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="rounded-2xl bg-card border border-border p-8 text-center">
          <Shield className="w-10 h-10 text-accent mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">{t("admin.title")}</h1>
          <p className="text-sm text-muted mb-6">{t("admin.sessionRequired")}</p>
          <div className="flex flex-col items-center gap-3">
            <GoogleLoginButton
              connected={Boolean(profile.googleId)}
              displayName={profile.name}
              avatarUrl={profile.googleAvatar}
            />
            <Link href="/settings" className="text-sm text-accent hover:underline">
              {t("admin.goSettings")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-red-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        {error || t("admin.connectionError")}
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

      {error && (
        <p className="mb-4 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <StatCard label={t("admin.stat.catalog")} value={data.sync.totalGames.toLocaleString(numberLocale)} />
        <StatCard label={t("admin.stat.tracked")} value={String(data.stats.trackedGames)} />
        <StatCard label={t("admin.stat.alerts")} value={String(data.stats.activeAlerts)} />
        <StatCard label={t("admin.stat.wishlist")} value={String(data.stats.wishlistItems)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label={t("admin.stat.proUsers")} value={String(data.stats.proUsers ?? 0)} />
        <StatCard label={t("admin.stat.googleUsers")} value={String(data.stats.googleUsers ?? 0)} />
        <StatCard label={t("admin.stat.notifications7d")} value={String(data.stats.notifications7d ?? 0)} />
        <StatCard label={t("admin.stat.referrals")} value={String(data.stats.referrals ?? 0)} />
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <LogIn className="w-4 h-4" />
          {t("admin.googleUsers.title")}
        </h2>
        <p className="text-sm text-muted mb-4">{t("admin.googleUsers.subtitle")}</p>
        {googleUsers.length === 0 ? (
          <p className="text-sm text-muted">{t("admin.googleUsers.empty")}</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {googleUsers.map((user) => (
              <UserRow
                key={user.sessionId}
                user={user}
                t={t}
                actionLoading={actionLoading}
                onSetAccess={setUserAccess}
                onGrantCosmetic={grantCosmetic}
              />
            ))}
          </div>
        )}
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
              <div key={job.id} className="flex flex-col gap-1 py-2 border-b border-border/50 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
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
        <ActionButton label={t("admin.action.syncCatalog")} loading={actionLoading === "sync-catalog"} onClick={() => runAction("sync-catalog", { rawgPages: 5 })} />
        <ActionButton label={t("admin.action.syncMeili")} loading={actionLoading === "sync-meilisearch"} onClick={() => runAction("sync-meilisearch")} />
        <ActionButton label={t("admin.action.syncPrices")} loading={actionLoading === "sync-prices"} onClick={() => runAction("sync-prices")} />
        <ActionButton label={t("admin.action.refresh")} loading={loading} onClick={() => fetchData()} />
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
            {users.map((user) => (
              <UserRow
                key={user.sessionId}
                user={user}
                t={t}
                actionLoading={actionLoading}
                onSetAccess={setUserAccess}
                onGrantCosmetic={grantCosmetic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  t,
  actionLoading,
  onSetAccess,
  onGrantCosmetic,
}: {
  user: AdminUser;
  t: (key: string) => string;
  actionLoading: string | null;
  onSetAccess: (user: AdminUser, access: { isAdmin?: boolean; isPro?: boolean }) => void;
  onGrantCosmetic: (user: AdminUser, type: "badge" | "frame" | "effect", key: string) => void;
}) {
  const displayName = user.name || user.steamPersona || user.email || user.sessionId.slice(0, 8);
  const avatar = user.googleAvatar || user.steamAvatar;
  const isPro = user.plan === "pro";

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {avatar ? (
            <Image src={avatar} alt={displayName} width={44} height={44} className="w-11 h-11 rounded-xl object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-accent/10" />
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted truncate">{user.email || user.googleId || user.steamId || user.sessionId}</p>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              {user.googleId && <span className="px-2 py-0.5 rounded-full border border-border text-sky-300">Google</span>}
              {user.steamId && <span className="px-2 py-0.5 rounded-full border border-border">Steam</span>}
              <span className="px-2 py-0.5 rounded-full border border-border">{t("admin.users.plan")}: {user.plan}</span>
              {user.isAdmin && <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">Admin</span>}
              {isPro && <Crown className="w-4 h-4 text-amber-300" />}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
          <MiniAction label={user.isAdmin ? t("admin.users.revokeAdmin") : t("admin.users.grantAdmin")} loading={actionLoading === `user-access:${user.sessionId}:admin:${!user.isAdmin}`} onClick={() => onSetAccess(user, { isAdmin: !user.isAdmin })} />
          <MiniAction label={isPro ? t("admin.users.revokePro") : t("admin.users.grantPro")} loading={actionLoading === `user-access:${user.sessionId}:pro:${!isPro}`} onClick={() => onSetAccess(user, { isPro: !isPro })} />
          <MiniAction label={t("admin.users.grantFounder")} loading={actionLoading === `grant-cosmetic:${user.sessionId}:badge:founder`} onClick={() => onGrantCosmetic(user, "badge", "founder")} />
        </div>
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
      {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
      <span>{label}</span>
    </div>
  );
}

function ActionButton({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      {label}
    </button>
  );
}

function MiniAction({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading} className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border text-xs sm:text-sm hover:border-accent/30 disabled:opacity-50">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {label}
    </button>
  );
}
