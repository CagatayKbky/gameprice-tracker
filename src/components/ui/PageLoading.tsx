import { Loader2 } from "lucide-react";

export function PageLoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-muted" />
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-card" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-32 rounded-lg bg-card" />
          <div className="h-4 w-48 rounded bg-card" />
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl bg-card border border-border p-6 mb-6 h-36" />
      ))}
    </div>
  );
}

export function GameGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-2xl bg-card" />
      ))}
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-3 py-6 sm:px-6 sm:py-8 animate-pulse">
      <div className="rounded-2xl bg-[#1b2838] h-40 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-card h-24" />
        ))}
      </div>
      <div className="rounded-2xl bg-card h-48 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl bg-card" />
        ))}
      </div>
    </div>
  );
}
