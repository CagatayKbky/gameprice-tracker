"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NavBadges() {
  const [counts, setCounts] = useState({ wishlist: 0, alerts: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/wishlist").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
    ])
      .then(([wishlist, alerts]) => {
        setCounts({
          wishlist: Array.isArray(wishlist) ? wishlist.length : 0,
          alerts: Array.isArray(alerts)
            ? alerts.filter((a: { isActive: boolean }) => a.isActive).length
            : 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <NavBadge href="/wishlist" count={counts.wishlist} />
      <NavBadge href="/alerts" count={counts.alerts} />
    </>
  );
}

function NavBadge({ href, count }: { href: string; count: number }) {
  if (count === 0) return null;
  return (
    <Link href={href} className="hidden lg:block">
      <span className="sr-only">{href}</span>
    </Link>
  );
}

export function NavBadgeInline({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white min-w-[18px] text-center",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
