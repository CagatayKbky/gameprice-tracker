"use client";

import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { getSteamLibraryImage } from "@/lib/game-images";

type GameImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  steamAppId?: string | null;
  fill?: boolean;
  priority?: boolean;
  fallbackClassName?: string;
};

/**
 * Uses native <img> so any store CDN from CheapShark works
 * without next/image hostname whitelist issues.
 * Falls back to Steam library art on error when steamAppId is known.
 */
export function GameImage({
  src,
  alt,
  steamAppId,
  className,
  fallbackClassName,
  fill,
  priority,
  ...props
}: GameImageProps) {
  const fallbackSrc = steamAppId ? getSteamLibraryImage(steamAppId) : undefined;
  const candidates = [src, fallbackSrc].filter(
    (url, i, arr): url is string => Boolean(url) && arr.indexOf(url) === i
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const displaySrc = candidates[candidateIndex];

  if (!displaySrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-card-hover to-card text-muted select-none",
          fill && "absolute inset-0 w-full h-full",
          fallbackClassName,
          !fill && className
        )}
        aria-label={alt}
      >
        <span className="text-3xl opacity-60">🎮</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((i) => i + 1);
        }
      }}
      className={cn(fill && "absolute inset-0 w-full h-full", className)}
      {...props}
    />
  );
}
