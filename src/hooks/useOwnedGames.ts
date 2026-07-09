"use client";

import { useEffect, useState } from "react";

let cachedAppIds: Set<string> | null = null;
let fetchPromise: Promise<Set<string>> | null = null;

function loadOwnedAppIds(): Promise<Set<string>> {
  if (cachedAppIds) return Promise.resolve(cachedAppIds);
  if (!fetchPromise) {
    fetchPromise = fetch("/api/steam/library")
      .then((r) => r.json())
      .then((d) => {
        cachedAppIds = new Set<string>(d.appIds || []);
        return cachedAppIds;
      })
      .catch(() => new Set<string>());
  }
  return fetchPromise;
}

export function useOwnedGames() {
  const [appIds, setAppIds] = useState<Set<string>>(cachedAppIds || new Set());

  useEffect(() => {
    loadOwnedAppIds().then(setAppIds);
  }, []);

  const isOwned = (gameId: string, steamAppId?: string) => {
    const appId = steamAppId || (gameId.startsWith("steam-") ? gameId.replace("steam-", "") : null);
    return appId ? appIds.has(appId) : false;
  };

  return { appIds, isOwned, count: appIds.size };
}

export function invalidateOwnedCache() {
  cachedAppIds = null;
  fetchPromise = null;
}
