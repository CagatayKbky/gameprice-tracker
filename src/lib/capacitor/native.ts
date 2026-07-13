"use client";

export function isNativeApp() {
  if (typeof window === "undefined") return false;
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export async function openNativeAuth(path: string) {
  if (!isNativeApp()) {
    window.location.href = path;
    return;
  }

  if (path.includes("/api/auth/google")) {
    try {
      const res = await fetch("/api/auth/native-start", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { url?: string };
      if (!res.ok || !data.url) throw new Error("native_start_failed");
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: data.url });
      return;
    } catch {
      window.location.href = "/api/auth/google?native=1";
      return;
    }
  }

  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: `${window.location.origin}${path}` });
  } catch {
    window.location.href = path;
  }
}

export async function completeNativeAuth(code: string) {
  const res = await fetch("/api/auth/native-complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code }),
  });
  return res.ok;
}
