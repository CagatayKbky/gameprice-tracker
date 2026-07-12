import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("gogVsSteamGuide", locale, { path: "/guides/gog-vs-steam" });
}

export default async function GogVsSteamGuidePage() {
  const locale = await getServerLocale();

  return (
    <GuideLayout
      slug="gog-vs-steam"
      title={t(locale, "guides.gogVsSteam.title")}
      subtitle={t(locale, "guides.gogVsSteam.subtitle")}
      readMinutes={4}
      cta={{ href: "/compare", label: t(locale, "guides.gogVsSteam.cta") }}
    >
      <p>{t(locale, "guides.gogVsSteam.p1")}</p>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.gogVsSteam.h2tips")}</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.gogVsSteam.tip1")}</li>
        <li>{t(locale, "guides.gogVsSteam.tip2")}</li>
        <li>{t(locale, "guides.gogVsSteam.tip3")}</li>
      </ul>
    </GuideLayout>
  );
}
