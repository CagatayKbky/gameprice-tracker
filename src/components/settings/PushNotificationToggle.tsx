"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationToggleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function PushNotificationToggle({
  enabled,
  onEnabledChange,
}: PushNotificationToggleProps) {
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
  }, []);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready.then(async (registration) => {
      const sub = await registration.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, [supported]);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setError("VAPID anahtarı tanımlı değil.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Bildirim izni verilmedi.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      if (!res.ok) throw new Error("Abonelik kaydedilemedi.");
      setSubscribed(true);
      onEnabledChange(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Push aboneliği başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      onEnabledChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Abonelik iptal edilemedi.");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <p className="text-xs text-muted bg-card-hover rounded-lg p-3">
        Tarayıcınız web push bildirimlerini desteklemiyor.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled && subscribed}
          disabled={loading}
          onChange={(e) => (e.target.checked ? subscribe() : unsubscribe())}
          className="w-4 h-4 rounded accent-accent"
        />
        <div className="flex items-center gap-2">
          {subscribed ? (
            <Bell className="w-4 h-4 text-emerald-400" />
          ) : (
            <BellOff className="w-4 h-4 text-muted" />
          )}
          <span className="text-sm">Tarayıcı push bildirimleri</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-muted" />}
        </div>
      </label>
      <p className="text-xs text-muted">
        Fiyat alarmı tetiklendiğinde anlık bildirim alın (site kapalı olsa bile).
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
