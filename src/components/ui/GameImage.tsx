"use client";

import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GameImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  fallbackClassName?: string;
};

/**
 * Uses native <img> so any store CDN from CheapShark works
 * without next/image hostname whitelist issues.
 */
export function GameImage({
  src,
  alt,
  className,
  fallbackClassName,
  fill,
  priority,
  ...props
}: GameImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-card-hover text-muted select-none",
          fill && "absolute inset-0 w-full h-full",
          fallbackClassName,
          !fill && className
        )}
        aria-label={alt}
      >
        <span className="text-3xl">🎮</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={cn(fill && "absolute inset-0 w-full h-full", className)}
      {...props}
    />
  );
}
