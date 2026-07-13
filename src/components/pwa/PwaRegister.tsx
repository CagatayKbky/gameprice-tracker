"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        registration?.update().catch(() => {});
      }
    };

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
        reg.update().catch(() => {});
        document.addEventListener("visibilitychange", onVisible);
      })
      .catch(() => {});

    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);
  return null;
}
