"use client";

import { useState } from "react";
import { GameImage } from "@/components/ui/GameImage";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

interface ScreenshotGalleryProps {
  screenshots: { url: string; thumbnail: string }[];
  title: string;
}

export function ScreenshotGallery({ screenshots, title }: ScreenshotGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!screenshots.length) return null;

  const prev = () => setActive((a) => (a === 0 ? screenshots.length - 1 : a - 1));
  const next = () => setActive((a) => (a === screenshots.length - 1 ? 0 : a + 1));

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">Ekran Görüntüleri</h2>

      <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
        <div className="relative aspect-video">
          <GameImage
            src={screenshots[active].url}
            alt={`${title} screenshot ${active + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <button
            onClick={() => setLightbox(true)}
            className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <Expand className="w-4 h-4" />
          </button>
          {screenshots.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {screenshots.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {screenshots.map((shot, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative w-24 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                  i === active ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <GameImage
                  src={shot.thumbnail}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
            onClick={() => setLightbox(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-5xl aspect-video">
            <GameImage
              src={screenshots[active].url}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </section>
  );
}
