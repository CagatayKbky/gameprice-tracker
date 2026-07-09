import { SteamGameDetails } from "@/lib/api/steam";

interface GameInfoProps {
  steam: SteamGameDetails;
}

export function GameInfo({ steam }: GameInfoProps) {
  return (
    <section className="mb-10 rounded-2xl bg-card border border-border p-6">
      <h2 className="text-xl font-bold mb-4">Oyun Hakkında</h2>

      {steam.genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {steam.genres.map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20"
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-muted leading-relaxed mb-6">
        {steam.shortDescription || steam.description.slice(0, 500)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {steam.developers.length > 0 && (
          <div>
            <span className="text-muted">Geliştirici</span>
            <p className="font-medium mt-0.5">{steam.developers.join(", ")}</p>
          </div>
        )}
        {steam.publishers.length > 0 && (
          <div>
            <span className="text-muted">Yayıncı</span>
            <p className="font-medium mt-0.5">{steam.publishers.join(", ")}</p>
          </div>
        )}
        {steam.releaseDate && (
          <div>
            <span className="text-muted">Çıkış Tarihi</span>
            <p className="font-medium mt-0.5">{steam.releaseDate}</p>
          </div>
        )}
        {steam.steamRating && (
          <div>
            <span className="text-muted">Steam İncelemeleri</span>
            <p className="font-medium mt-0.5">
              {steam.steamRating.count.toLocaleString("tr-TR")} inceleme
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
