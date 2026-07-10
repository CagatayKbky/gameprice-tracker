"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  Gamepad2,
  Bell,
  Heart,
  Menu,
  X,
  TrendingDown,
  Store,
  GitCompareArrows,
  Settings,
  Library,
  Package,
  User,
  MoreHorizontal,
  Sparkles,
  Users,
  BookOpen,
} from "lucide-react";
import { CurrencySwitcher } from "@/components/layout/CurrencySwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { SearchBar } from "@/components/layout/SearchBar";
import { NavBadgeInline } from "@/components/layout/NavBadges";
import { useCompare } from "@/components/providers/CompareProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { href: "/", labelKey: "nav.home", icon: Gamepad2 },
  { href: "/browse", labelKey: "nav.catalog", icon: Library },
  { href: "/deals", labelKey: "nav.deals", icon: TrendingDown },
  { href: "/wishlist", labelKey: "nav.wishlist", icon: Heart },
  { href: "/alerts", labelKey: "nav.alerts", icon: Bell },
];

const secondaryNavItems = [
  { href: "/bundles", labelKey: "nav.bundles", icon: Package },
  { href: "/compare", labelKey: "nav.compare", icon: GitCompareArrows },
  { href: "/social", labelKey: "nav.social", icon: Users },
  { href: "/notifications", labelKey: "nav.notifications", icon: Bell },
  { href: "/guides", labelKey: "nav.guides", icon: BookOpen },
  { href: "/pricing", labelKey: "nav.premium", icon: Sparkles },
  { href: "/platforms", labelKey: "nav.platforms", icon: Store },
];

const allNavItems = [...primaryNavItems, ...secondaryNavItems];

function getBadge(
  href: string,
  counts: { wishlist: number; alerts: number; notifications: number },
  compareCount: number
) {
  if (href === "/wishlist") return counts.wishlist;
  if (href === "/alerts") return counts.alerts;
  if (href === "/notifications") return counts.notifications;
  if (href === "/compare") return compareCount;
  return 0;
}

export function Header() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [counts, setCounts] = useState({ wishlist: 0, alerts: 0, notifications: 0 });
  const { games: compareGames } = useCompare();

  useEffect(() => {
    Promise.all([
      fetch("/api/wishlist").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
      fetch("/api/notifications").then((r) => r.json()),
    ])
      .then(([wishlist, alerts, notifications]) => {
        setCounts({
          wishlist: Array.isArray(wishlist) ? wishlist.length : 0,
          alerts: Array.isArray(alerts)
            ? alerts.filter((a: { isActive: boolean }) => a.isActive).length
            : 0,
          notifications: notifications?.unread || 0,
        });
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const secondaryActive = secondaryNavItems.some((item) => pathname === item.href);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              GamePrice
            </span>
          </Link>

          <div className="flex-1 min-w-0 hidden md:block max-w-md lg:max-w-sm xl:max-w-md">
            <Suspense fallback={<div className="h-10 bg-card rounded-xl animate-pulse" />}>
              <SearchBar className="w-full" />
            </Suspense>
          </div>

          <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const badge = getBadge(item.href, counts, compareGames.length);
              const label = t(item.labelKey);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={label}
                  className={cn(
                    "relative flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-foreground hover:bg-card-hover"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline">{label}</span>
                  <NavBadgeInline count={badge} />
                </Link>
              );
            })}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                title={t("nav.more")}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  secondaryActive || moreOpen
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-foreground hover:bg-card-hover"
                )}
              >
                <MoreHorizontal className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">{t("nav.more")}</span>
              </button>

              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl bg-card border border-border shadow-xl py-1">
                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      const badge = getBadge(item.href, counts, compareGames.length);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-card-hover transition-colors",
                            isActive && "text-accent bg-accent/5"
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1">{t(item.labelKey)}</span>
                          <NavBadgeInline count={badge} />
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto">
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors md:hidden"
              title={t("nav.notifications")}
            >
              <Bell className="w-4 h-4" />
              <NavBadgeInline count={counts.notifications} className="absolute -top-0.5 -right-0.5" />
            </Link>
            <Link
              href="/profile"
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors hidden sm:block"
              title={t("nav.profile")}
            >
              <User className="w-4 h-4" />
            </Link>
            <Link
              href="/settings"
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors"
              title={t("nav.settings")}
            >
              <Settings className="w-4 h-4" />
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
            <CurrencySwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-card-hover"
              aria-label="Menü"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-3">
            <Suspense fallback={<div className="h-10 bg-card rounded-xl animate-pulse" />}>
              <SearchBar />
            </Suspense>
            <nav className="flex flex-col gap-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const badge = getBadge(item.href, counts, compareGames.length);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-card-hover",
                      pathname === item.href && "bg-accent/10 text-accent"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{t(item.labelKey)}</span>
                    <NavBadgeInline count={badge} />
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
