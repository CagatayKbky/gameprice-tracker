import { GameCardSkeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div>
      <div className="h-80 bg-card/50 border-b border-border animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
