"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";
import { PageLoadingSpinner } from "@/components/ui/PageLoading";
import { useLocale } from "@/components/providers/LocaleProvider";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  url?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const { t } = useLocale();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchJson<{ items?: NotificationItem[]; unread?: number }>("/api/notifications", 10_000)
      .then((data) => {
        setItems(data.items || []);
        setUnread(data.unread || 0);
      })
      .catch(() => {
        setItems([]);
        setUnread(0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", id }),
    });
    load();
  };

  const markAllRead = async () => {
    setBusy(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read-all" }),
      });
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b2838] border border-[#2a475e]/60">
            <Bell className="h-5 w-5 text-[#66c0f4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("notifications.title")}</h1>
            <p className="text-sm text-[#8f98a0]">
              {unread > 0 ? t("notifications.unread", { count: String(unread) }) : t("notifications.allRead")}
            </p>
          </div>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a475e] px-3 py-2 text-xs text-[#66c0f4] hover:bg-[#1b2838] disabled:opacity-50 self-start sm:self-auto whitespace-normal sm:whitespace-nowrap"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      {loading ? (
        <PageLoadingSpinner />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#2a475e]/60 bg-[#1b2838]/40 px-4 py-10 text-center text-sm text-[#8f98a0]">
          {t("notifications.empty")}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const unreadItem = !item.readAt;
            const content = (
              <div
                className={`rounded-xl border px-4 py-3 transition-colors ${
                  unreadItem
                    ? "border-[#66c0f4]/30 bg-[#2a475e]/25"
                    : "border-[#2a475e]/40 bg-[#1b2838]/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-[#8f98a0]">{item.body}</p>
                    <p className="mt-2 text-[10px] text-[#8f98a0]/80">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {unreadItem && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#66c0f4]" />
                  )}
                </div>
              </div>
            );

            if (item.url) {
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => unreadItem && void markRead(item.id)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className="w-full text-left"
                onClick={() => unreadItem && void markRead(item.id)}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
