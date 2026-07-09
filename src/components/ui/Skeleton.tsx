export function GameCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border animate-pulse">
      <div className="aspect-[3/4] bg-card-hover" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-card-hover rounded w-3/4" />
        <div className="h-4 bg-card-hover rounded w-1/2" />
        <div className="h-6 bg-card-hover rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

export function GameDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="w-full md:w-72 aspect-[3/4] rounded-2xl bg-card-hover mx-auto md:mx-0" />
        <div className="flex-1 space-y-4">
          <div className="h-10 bg-card-hover rounded w-2/3" />
          <div className="h-8 bg-card-hover rounded w-1/4" />
          <div className="h-4 bg-card-hover rounded w-1/3" />
          <div className="flex gap-3 mt-6">
            <div className="h-10 bg-card-hover rounded-xl w-32" />
            <div className="h-10 bg-card-hover rounded-xl w-40" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card-hover rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="h-80 bg-card-hover rounded-2xl" />
    </div>
  );
}

export function DealCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-card border border-border animate-pulse">
      <div className="w-28 h-36 rounded-lg bg-card-hover shrink-0" />
      <div className="flex-1 space-y-3 py-2">
        <div className="h-5 bg-card-hover rounded w-3/4" />
        <div className="h-4 bg-card-hover rounded w-1/3" />
        <div className="h-6 bg-card-hover rounded w-1/4" />
      </div>
    </div>
  );
}
