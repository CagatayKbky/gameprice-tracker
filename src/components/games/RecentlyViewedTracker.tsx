"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/components/providers/RecentlyViewedProvider";

interface RecentlyViewedTrackerProps {
  gameId: string;
  title: string;
  imageUrl?: string;
  steamAppId?: string;
}

export function RecentlyViewedTracker({
  gameId,
  title,
  imageUrl,
  steamAppId,
}: RecentlyViewedTrackerProps) {
  const { addGame } = useRecentlyViewed();

  useEffect(() => {
    addGame({ gameId, title, imageUrl, steamAppId });
  }, [addGame, gameId, title, imageUrl, steamAppId]);

  return null;
}
