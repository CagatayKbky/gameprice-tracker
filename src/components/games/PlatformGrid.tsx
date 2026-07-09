import { PLATFORMS } from "@/lib/platforms";

export function PlatformGrid() {
  const categories = [
    { key: "pc" as const, label: "PC Mağazaları" },
    { key: "console" as const, label: "Konsol Mağazaları" },
    { key: "subscription" as const, label: "Abonelikler" },
  ];

  return (
    <div className="space-y-8">
      {categories.map(({ key, label }) => {
        const platforms = PLATFORMS.filter((p) => p.category === key);
        return (
          <div key={key}>
            <h3 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
              {label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors"
                  style={{ borderColor: `${platform.color}30` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="text-sm font-medium">{platform.shortName}</span>
                  {platform.enabled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Aktif" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
