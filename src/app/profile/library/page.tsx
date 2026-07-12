"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Library, Loader2, Search, ArrowLeft, Clock3, Trash2 } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getSteamAppHeaderUrl } from "@/lib/api/steam-profile";
import { LibraryQuickActions } from "@/components/profile/LibraryQuickActions";
import { ManualLibraryImport } from "@/components/profile/ManualLibraryImport";

interface LibraryGame {
  steamAppId: string;
  name: string | null;
  playtimeMinutes: number;
  lastPlayedAt?: string | null;
}

interface ManualGame {
  id: string;
  platform: string;
  title: string;
}

type LibraryTab = "steam" | "epic" | "gog";

const PER_PAGE = 24;

export default function ProfileLibraryPage() {
  const { t } = useLocale();
  const [tab, setTab] = useState<LibraryTab>("steam");
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [manualGames, setManualGames] = useState<ManualGame[]>([]);
  const [count, setCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [recentPlayed, setRecentPlayed] = useState<LibraryGame[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"playtime" | "recent" | "name">("playtime");
  const [minHours, setMinHours] = useState(0);
  const [recentOnly, setRecentOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadManualGames = useCallback(() => {
    if (tab === "steam") return;
    setLoading(true);
    fetch(`/api/library/manual?platform=${tab}`)
      .then((r) => r.json())
      .then((data) => setManualGames(Array.isArray(data.games) ? data.games : []))
      .catch(() => setManualGames([]))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== "steam") {
      loadManualGames();
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      mode: "all",
      sort,
      page: String(page),
      perPage: String(PER_PAGE),
      minHours: String(minHours),
    });
    if (query.trim()) params.set("q", query.trim());
    if (recentOnly) params.set("recentOnly", "1");

    fetch(`/api/steam/library?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setGames(Array.isArray(data.games) ? data.games : []);
        setCount(data.count || 0);
        setFilteredCount(data.filteredCount || 0);
        setRecentPlayed(Array.isArray(data.recentPlayed) ? data.recentPlayed : []);
      })
      .catch(() => {
        setGames([]);
        setCount(0);
        setFilteredCount(0);
        setRecentPlayed([]);
      })
      .finally(() => setLoading(false));
  }, [loadManualGames, minHours, page, query, recentOnly, sort, tab]);

  useEffect(() => {
    setPage(1);
  }, [query, sort, minHours, recentOnly, tab]);

  const filteredManual = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return manualGames;
    return manualGames.filter((g) => g.title.toLowerCase().includes(q));
  }, [manualGames, query]);

  const subtitle = useMemo(() => {
    if (tab !== "steam") {
      return t("library.manual.count", { count: String(filteredManual.length) });
    }
    return query.trim() || minHours > 0 || recentOnly
      ? t("profile.libraryResults", {
          shown: String(filteredCount),
          total: String(count),
        })
      : t("profile.libraryCountFull", { count: String(count) });
  }, [count, filteredCount, filteredManual.length, minHours, query, recentOnly, t, tab]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / PER_PAGE));

  const deleteManual = async (id: string) => {
    await fetch(`/api/library/manual?id=${id}`, { method: "DELETE" });
    loadManualGames();
  };

  const tabs: { id: LibraryTab; label: string }[] = [
    { id: "steam", label: t("library.tab.steam") },
    { id: "epic", label: t("library.tab.epic") },
    { id: "gog", label: t("library.tab.gog") },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("profile.backToProfile")}
        </Link>

        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#66c0f4]/10 flex items-center justify-center">
            <Library className="w-5 h-5 text-[#66c0f4]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t("profile.libraryTitle")}</h1>
            <p className="text-sm text-muted mt-1">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              tab === item.id
                ? "bg-accent text-white border-accent"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab !== "steam" && (
        <ManualLibraryImport platform={tab} onImported={loadManualGames} />
      )}

      {tab === "steam" && recentPlayed.length > 0 && !query.trim() && !recentOnly && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock3 className="w-4 h-4 text-accent" />
            <h2 className="font-semibold">{t("profile.libraryRecentTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentPlayed.map((game) => (
              <Link
                key={`recent-${game.steamAppId}`}
                href={`/game/steam-${game.steamAppId}`}
                className="group flex gap-3 rounded-2xl border border-border bg-card hover:border-accent/30 transition-colors p-3"
              >
                <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-background">
                  <Image
                    src={getSteamAppHeaderUrl(game.steamAppId)}
                    alt={game.name || ""}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm line-clamp-2">{game.name || `App ${game.steamAppId}`}</p>
                  {game.lastPlayedAt && (
                    <p className="text-xs text-muted mt-1">
                      {t("profile.libraryLastPlayed", {
                        date: new Date(game.lastPlayedAt).toLocaleDateString(),
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-2xl border border-border bg-card p-4 mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("profile.librarySearch")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm"
          />
        </div>
        {tab === "steam" && (
          <>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "playtime" | "recent" | "name")}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm min-w-0"
            >
              <option value="playtime">{t("profile.librarySortPlaytime")}</option>
              <option value="recent">{t("profile.librarySortRecent")}</option>
              <option value="name">{t("profile.librarySortName")}</option>
            </select>
            <select
              value={String(minHours)}
              onChange={(e) => setMinHours(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm min-w-0"
            >
              <option value="0">{t("profile.libraryMinHoursAny")}</option>
              <option value="1">{t("profile.libraryMinHours1")}</option>
              <option value="5">{t("profile.libraryMinHours5")}</option>
              <option value="20">{t("profile.libraryMinHours20")}</option>
              <option value="50">{t("profile.libraryMinHours50")}</option>
            </select>
            <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-background border border-border text-sm">
              <input
                type="checkbox"
                checked={recentOnly}
                onChange={(e) => setRecentOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-accent"
              />
              {t("profile.libraryRecentOnly")}
            </label>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      ) : tab !== "steam" ? (
        filteredManual.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted">
            {t("library.manual.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredManual.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <p className="font-medium text-sm line-clamp-2">{game.title}</p>
                <button
                  type="button"
                  onClick={() => void deleteManual(game.id)}
                  className="shrink-0 p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted">
          {t("profile.libraryEmpty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Link
              key={game.steamAppId}
              href={`/game/steam-${game.steamAppId}`}
              className="group flex gap-3 rounded-2xl border border-border bg-card hover:border-accent/30 transition-colors p-3"
            >
              <div className="relative w-28 h-16 rounded-lg overflow-hidden shrink-0 bg-background">
                <Image
                  src={getSteamAppHeaderUrl(game.steamAppId)}
                  alt={game.name || ""}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="112px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm line-clamp-2">{game.name || `App ${game.steamAppId}`}</p>
                <p className="text-xs text-muted mt-1">
                  {t("profile.libraryPlaytime", {
                    hours: String(Math.round(game.playtimeMinutes / 60)),
                  })}
                </p>
                {game.lastPlayedAt && (
                  <p className="text-xs text-muted mt-1 inline-flex items-center gap-1">
                    <Clock3 className="w-3 h-3" />
                    {new Date(game.lastPlayedAt).toLocaleDateString()}
                  </p>
                )}
                <LibraryQuickActions
                  gameId={`steam-${game.steamAppId}`}
                  title={game.name || `App ${game.steamAppId}`}
                  imageUrl={getSteamAppHeaderUrl(game.steamAppId)}
                />
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === "steam" && !loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-50"
          >
            {t("browse.prev")}
          </button>
          <span className="text-sm text-muted">
            {t("browse.page", { page: String(page), total: String(totalPages) })}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-50"
          >
            {t("browse.next")}
          </button>
        </div>
      )}
    </div>
  );
}
