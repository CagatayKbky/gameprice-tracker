"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface Entry {
  rank: number;
  name: string;
  avatarUrl: string | null;
  profileSlug: string | null;
  score: number;
}

export function LeaderboardPanel() {
  const { t } = useLocale();
  const [wishlist, setWishlist] = useState<Entry[]>([]);
  const [library, setLibrary] = useState<Entry[]>([]);

  useEffect(() => {
    fetch("/api/social/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setWishlist(data.wishlist || []);
        setLibrary(data.library || []);
      })
      .catch(() => {});
  }, []);

  if (wishlist.length === 0 && library.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h2 className="font-semibold">{t("leaderboard.title")}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeaderboardList title={t("leaderboard.wishlist")} entries={wishlist} />
        <LeaderboardList title={t("leaderboard.library")} entries={library} />
      </div>
    </section>
  );
}

function LeaderboardList({ title, entries }: { title: string; entries: Entry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-muted mb-3">{title}</h3>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={`${title}-${entry.rank}`} className="flex items-center gap-3">
            <span className="w-6 text-center text-xs font-bold text-accent">#{entry.rank}</span>
            {entry.avatarUrl ? (
              <Image
                src={entry.avatarUrl}
                alt={entry.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/10 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              {entry.profileSlug ? (
                <Link href={`/u/${entry.profileSlug}`} className="text-sm font-medium truncate block hover:text-accent">
                  {entry.name}
                </Link>
              ) : (
                <p className="text-sm font-medium truncate">{entry.name}</p>
              )}
            </div>
            <span className="text-sm font-semibold shrink-0">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
