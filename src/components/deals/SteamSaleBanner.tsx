import { TrendingDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { getSteamSaleEndIso } from "@/lib/api/steam-deals";
import { SaleCountdown } from "@/components/deals/SaleCountdown";

export async function SteamSaleBanner() {
  const locale = await getServerLocale();
  const saleEnd = await getSteamSaleEndIso();

  return (
    <div className="mb-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{t(locale, "deals.steamBanner.title")}</h2>
            <p className="text-sm text-muted mt-1 max-w-xl">
              {t(locale, "deals.steamBanner.subtitle")}
            </p>
            <div className="mt-3">
              <SaleCountdown endAt={saleEnd} />
            </div>
          </div>
        </div>
        <Link
          href="https://store.steampowered.com/search/?specials=1&cc=TR"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b2838] text-white text-sm font-medium hover:bg-[#2a475e] transition-colors shrink-0"
        >
          {t(locale, "deals.steamBanner.cta")}
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
