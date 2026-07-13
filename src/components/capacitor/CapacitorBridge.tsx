"use client";

import { useEffect } from "react";
import { completeNativeAuth, isNativeApp } from "@/lib/capacitor/native";

export function CapacitorBridge() {
  useEffect(() => {
    if (!isNativeApp()) return;

    let removeListener: (() => void) | undefined;

    void (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("appUrlOpen", async (event) => {
          try {
            const url = new URL(event.url);
            if (url.hostname !== "auth") return;
            const code = url.searchParams.get("code");
            if (!code) return;

            const { Browser } = await import("@capacitor/browser");
            await Browser.close().catch(() => {});

            const ok = await completeNativeAuth(code);
            window.location.href = ok ? "/profile?google=ok" : "/settings?google=error";
          } catch {
            window.location.href = "/settings?google=error";
          }
        });
        removeListener = () => void handle.remove();
      } catch {
        /* web fallback */
      }
    })();

    return () => removeListener?.();
  }, []);

  return null;
}
