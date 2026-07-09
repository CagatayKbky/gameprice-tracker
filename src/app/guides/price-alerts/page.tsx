import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("priceAlertsGuide", locale, { path: "/guides/price-alerts" });
}

export default async function PriceAlertsGuidePage() {
  const locale = await getServerLocale();

  return (
    <GuideLayout
      slug="price-alerts"
      title={t(locale, "guides.priceAlerts.title")}
      subtitle={t(locale, "guides.priceAlerts.subtitle")}
      readMinutes={3}
      cta={{ href: "/alerts", label: t(locale, "guides.priceAlerts.cta") }}
    >
      <p>{t(locale, "guides.priceAlerts.p1")}</p>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.priceAlerts.h2steps")}</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>{t(locale, "guides.priceAlerts.step1")}</li>
        <li>{t(locale, "guides.priceAlerts.step2")}</li>
        <li>{t(locale, "guides.priceAlerts.step3")}</li>
        <li>{t(locale, "guides.priceAlerts.step4")}</li>
      </ol>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.priceAlerts.h2tips")}</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.priceAlerts.tip1")}</li>
        <li>{t(locale, "guides.priceAlerts.tip2")}</li>
        <li>{t(locale, "guides.priceAlerts.tip3")}</li>
      </ul>
      <p>
        {t(locale, "guides.priceAlerts.p2")}{" "}
        <Link href="/pricing" className="text-[#66c0f4] hover:underline">
          GamePrice Pro
        </Link>
        .
      </p>
    </GuideLayout>
  );
}
