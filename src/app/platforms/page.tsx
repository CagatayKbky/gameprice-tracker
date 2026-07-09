import Link from "next/link";
import { Store, ExternalLink } from "lucide-react";
import { PLATFORMS } from "@/lib/platforms";
import { PlatformGrid } from "@/components/games/PlatformGrid";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

export default async function PlatformsPage() {
  const locale = await getServerLocale();
  const pcCount = PLATFORMS.filter((p) => p.category === "pc").length;
  const consoleCount = PLATFORMS.filter((p) => p.category === "console").length;

  const categoryLabel = (category: string) => {
    if (category === "pc") return t(locale, "platforms.pc");
    if (category === "console") return t(locale, "platforms.console");
    return t(locale, "platforms.subscription");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Store className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t(locale, "platforms.title")}</h1>
          <p className="text-muted mt-1">
            {t(locale, "platforms.subtitle")
              .replace("{total}", String(PLATFORMS.length))
              .replace("{pc}", String(pcCount))
              .replace("{console}", String(consoleCount))}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 mb-10">
        <PlatformGrid />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className="p-5 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors"
            style={{ borderLeftColor: platform.color, borderLeftWidth: 3 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{platform.name}</h3>
                <p className="text-xs text-muted mt-1 capitalize">
                  {categoryLabel(platform.category)}
                </p>
              </div>
              <span
                className={`w-2 h-2 rounded-full mt-2 ${
                  platform.enabled ? "bg-emerald-400" : "bg-muted"
                }`}
                title={platform.enabled ? t(locale, "platforms.enabled") : t(locale, "platforms.disabled")}
              />
            </div>

            {platform.region && (
              <p className="text-xs text-muted mt-3">
                {t(locale, "platforms.region")}: {platform.region}
              </p>
            )}

            {platform.cheapSharkId && (
              <Link
                href={`/platforms/${platform.id}`}
                className="inline-flex items-center gap-1 text-xs text-accent mt-3 hover:underline"
              >
                {t(locale, "platforms.viewDeals")}
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
