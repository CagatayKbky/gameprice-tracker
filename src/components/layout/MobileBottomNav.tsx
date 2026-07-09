"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingDown, Search, Heart, User } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

const links = [
  { href: "/", icon: Home, labelKey: "nav.home" },
  { href: "/deals", icon: TrendingDown, labelKey: "nav.deals" },
  { href: "/search", icon: Search, labelKey: "search.title" },
  { href: "/wishlist", icon: Heart, labelKey: "nav.wishlist" },
  { href: "/profile", icon: User, labelKey: "nav.profile" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-14">
        {links.map(({ href, icon: Icon, labelKey }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] transition-colors ${
                active ? "text-accent" : "text-muted hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : ""}`} />
              <span className="truncate max-w-[4.5rem]">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
