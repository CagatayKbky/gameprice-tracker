import { RegionalSteamPrice } from "@/lib/api/steam-regional";

interface RegionalPriceCompareProps {
  prices: RegionalSteamPrice[];
}

export function RegionalPriceCompare({ prices }: RegionalPriceCompareProps) {
  if (prices.length < 2) return null;

  const cheapest = prices.reduce((min, p) => (p.final < min.final ? p : min), prices[0]);

  return (
    <section className="mb-10 rounded-2xl bg-card border border-border p-6">
      <h2 className="text-xl font-bold mb-4">Bölgesel Steam Fiyatları</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {prices.map((p) => (
          <div
            key={p.region}
            className={`rounded-xl border p-4 ${
              p.region === cheapest.region
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-border"
            }`}
          >
            <p className="text-sm text-muted">{p.label}</p>
            <p className="text-xl font-bold mt-1">
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: p.currency.length === 3 ? p.currency : "USD",
              }).format(p.final)}
            </p>
            {p.discount > 0 && (
              <p className="text-xs text-emerald-400 mt-1">-%{p.discount}</p>
            )}
            {p.region === cheapest.region && (
              <p className="text-xs text-emerald-400 mt-2 font-medium">En ucuz bölge</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
