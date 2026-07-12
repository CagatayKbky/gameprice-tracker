"use client";

import { useEffect, useState } from "react";
import { User, Mail, Bell, Save, Loader2, Newspaper, MessageSquare, Crown } from "lucide-react";
import Link from "next/link";
import { PushNotificationToggle } from "@/components/settings/PushNotificationToggle";
import { SteamLoginButton } from "@/components/auth/SteamLoginButton";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { MagicLinkLogin } from "@/components/auth/MagicLinkLogin";
import { useLocale } from "@/components/providers/LocaleProvider";
import { usePremium } from "@/components/providers/PremiumProvider";
import { ProBadge } from "@/components/premium/PricingPlans";

export default function SettingsPage() {
  const { t } = useLocale();
  const { isPro, limits, usage, cancelSubscription } = usePremium();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [wishlistDealAlerts, setWishlistDealAlerts] = useState(true);
  const [freeGameNotify, setFreeGameNotify] = useState(true);
  const [hideOwnedGames, setHideOwnedGames] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [steamId, setSteamId] = useState<string | null>(null);
  const [steamPersona, setSteamPersona] = useState<string | null>(null);
  const [googleId, setGoogleId] = useState<string | null>(null);
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);
  const [librarySyncing, setLibrarySyncing] = useState(false);
  const [libraryCount, setLibraryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setEmail(data.email || "");
        setName(data.name || "");
        setEmailNotifications(data.emailNotifications !== false);
        setWeeklyDigest(data.weeklyDigest !== false);
        setPushNotifications(data.pushNotifications !== false);
        setDiscordWebhook(data.discordWebhook || "");
        setTelegramChatId(data.telegramChatId || "");
        setWishlistDealAlerts(data.wishlistDealAlerts !== false);
        setFreeGameNotify(data.freeGameNotify !== false);
        setHideOwnedGames(data.hideOwnedGames !== false);
        setPublicProfile(data.publicProfile !== false);
        setSteamId(data.steamId || null);
        setSteamPersona(data.steamPersona || null);
        setGoogleId(data.googleId || null);
        setGoogleAvatar(data.googleAvatar || null);
        if (data.steamId) {
          fetch("/api/steam/library")
            .then((r) => r.json())
            .then((lib) => setLibraryCount(lib.count ?? null))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          emailNotifications,
          weeklyDigest,
          pushNotifications,
          discordWebhook: discordWebhook || null,
          telegramChatId: telegramChatId || null,
          wishlistDealAlerts,
          freeGameNotify,
          hideOwnedGames,
          publicProfile,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <User className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
          <p className="text-muted text-sm mt-1">{t("settings.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Crown className="w-4 h-4 text-accent" />
              {t("premium.settings.title")}
              <ProBadge />
            </h2>
            {!isPro && (
              <Link
                href="/pricing"
                className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white font-medium"
              >
                {t("premium.upgradeCta")}
              </Link>
            )}
          </div>
          <p className="text-sm text-muted">
            {isPro ? t("premium.settings.active") : t("premium.settings.inactive")}
          </p>
          <p className="text-xs text-muted">
            {t("premium.settings.usage", {
              wishlist: String(usage.wishlist),
              wishlistMax: limits.wishlist === Infinity ? "∞" : String(limits.wishlist),
              alerts: String(usage.alerts),
              alertsMax: limits.alerts === Infinity ? "∞" : String(limits.alerts),
            })}
          </p>
          {isPro && (
            <button
              type="button"
              onClick={() => {
                if (confirm(t("premium.cancelConfirm"))) {
                  cancelSubscription().catch(() => alert(t("premium.cancelError")));
                }
              }}
              className="text-sm text-red-400 hover:underline"
            >
              {t("premium.cancelSubscription")}
            </button>
          )}
        </div>

        <MagicLinkLogin />

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="font-semibold">{t("auth.loginTitle")}</h2>
          <GoogleLoginButton
            connected={Boolean(googleId)}
            displayName={name}
            avatarUrl={googleAvatar}
          />
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-muted" />
            {t("settings.profile")}
          </h2>
          <div>
            <label className="text-sm text-muted block mb-2">{t("settings.name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("settings.namePlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted" />
            {t("settings.email")}
          </h2>
          <div>
            <label className="text-sm text-muted block mb-2">{t("settings.emailAddress")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("settings.emailPlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-muted mt-2">
              {t("settings.emailHint")}
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded accent-accent"
            />
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted" />
              <span className="text-sm">{t("settings.emailEnable")}</span>
            </div>
          </label>

          <p className="text-xs text-muted bg-card-hover rounded-lg p-3">
            {t("settings.emailEnvHint")}
          </p>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-4 h-4 rounded accent-accent"
            />
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-muted" />
              <span className="text-sm">{t("settings.weeklyDigest")}</span>
            </div>
          </label>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted" />
            {t("settings.push")}
            {!isPro && (
              <span className="text-xs text-accent font-normal">{t("premium.settings.proLocked")}</span>
            )}
          </h2>
          {isPro ? (
            <PushNotificationToggle
              enabled={pushNotifications}
              onEnabledChange={setPushNotifications}
            />
          ) : (
            <p className="text-sm text-muted">
              <Link href="/pricing" className="text-accent hover:underline">
                {t("premium.upgradeCta")}
              </Link>
              {" — "}
              {t("premium.upgrade.push.desc")}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="font-semibold">{t("settings.steam")}</h2>
          <SteamLoginButton connected={!!steamId} steamPersona={steamPersona} />
          <p className="text-xs text-muted">{t("settings.steamHint")}</p>
          {steamId && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={librarySyncing}
                  onClick={async () => {
                    setLibrarySyncing(true);
                    try {
                      const res = await fetch("/api/steam/library", { method: "POST" });
                      const data = await res.json();
                      if (res.ok) setLibraryCount(data.synced);
                      else alert(data.error || t("settings.librarySyncError"));
                    } finally {
                      setLibrarySyncing(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1b2838] text-white text-sm font-medium hover:bg-[#2a475e] disabled:opacity-50"
                >
                  {librarySyncing ? t("settings.librarySyncing") : t("settings.librarySync")}
                </button>
                {libraryCount != null && (
                  <span className="text-sm text-muted">
                    {t("settings.libraryCount", { count: String(libraryCount) })}
                  </span>
                )}
                {libraryCount && libraryCount > 0 && (
                  <Link href="/profile/library" className="text-sm text-accent hover:underline">
                    {t("profile.libraryViewAll")}
                  </Link>
                )}
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideOwnedGames}
                  onChange={(e) => setHideOwnedGames(e.target.checked)}
                  className="w-4 h-4 rounded accent-accent"
                />
                <span className="text-sm">{t("settings.hideOwned")}</span>
              </label>
            </>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted" />
            {t("settings.discordTelegram")}
          </h2>
          <div>
            <label className="text-sm text-muted block mb-2">{t("settings.discordWebhook")}</label>
            <input
              type="url"
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              placeholder={t("settings.discordPlaceholder")}
              disabled={!isPro}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm disabled:opacity-50"
            />
            {!isPro && (
              <p className="text-xs text-accent">
                <Link href="/pricing">{t("premium.upgradeCta")}</Link>
              </p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted block mb-2">{t("settings.telegramChatId")}</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder={t("settings.telegramPlaceholder")}
              disabled={!isPro}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm disabled:opacity-50"
            />
            <p className="text-xs text-muted mt-2">
              {t("settings.telegramHint")}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wishlistDealAlerts}
              onChange={(e) => setWishlistDealAlerts(e.target.checked)}
              className="w-4 h-4 rounded accent-accent"
            />
            <span className="text-sm">{t("settings.wishlistDeals")}</span>
          </label>
          <p className="text-xs text-muted mt-2">{t("settings.wishlistDealsHint")}</p>
          <label className="flex items-center gap-3 cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={freeGameNotify}
              onChange={(e) => setFreeGameNotify(e.target.checked)}
              className="w-4 h-4 rounded accent-accent"
            />
            <span className="text-sm">{t("settings.freeGameNotify")}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={publicProfile}
              onChange={(e) => setPublicProfile(e.target.checked)}
              className="w-4 h-4 rounded accent-accent"
            />
            <span className="text-sm">{t("settings.publicProfile")}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? t("settings.saved") : saving ? t("settings.saving") : t("common.save")}
        </button>
      </form>
    </div>
  );
}
