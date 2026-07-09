import Link from "next/link";
import { SaleCalendarGlobal } from "@/components/games/SaleCalendarGlobal";
import { Calendar } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

export const metadata = {
  title: "Oyun İndirim Takvimi 2026",
  description:
    "Steam yaz/kış indirimleri, Epic Mega Sale, PlayStation Days of Play ve Xbox Black Friday takvimi.",
};

export default async function SaleCalendarPage() {
  const locale = await getServerLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="w-6 h-6 text-accent" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t(locale, "saleCalendar.title")}</h1>
          <p className="text-muted text-sm mt-1">{t(locale, "saleCalendar.subtitle")}</p>
        </div>
      </div>

      <SaleCalendarGlobal />

      <article className="prose prose-invert max-w-none mt-10 space-y-4 text-sm text-muted leading-relaxed">
        <p>{t(locale, "saleCalendar.description1")}</p>
        <p>{t(locale, "saleCalendar.description2")}</p>
        <Link href="/deals" className="text-accent hover:underline inline-block">
          {t(locale, "saleCalendar.goToDeals")}
        </Link>
      </article>
    </div>
  );
}
