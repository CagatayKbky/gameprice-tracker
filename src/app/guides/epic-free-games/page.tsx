import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("epicFreeGuide", locale, { path: "/guides/epic-free-games" });
}

export default async function EpicFreeGuidePage() {
  const locale = await getServerLocale();

  return (
    <GuideLayout
      slug="epic-free-games"
      title={t(locale, "guides.epicFree.title")}
      subtitle={t(locale, "guides.epicFree.subtitle")}
      readMinutes={3}
      cta={{ href: "/deals", label: t(locale, "guides.epicFree.cta") }}
    >
      <p>{t(locale, "guides.epicFree.p1")}</p>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.epicFree.h2tips")}</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.epicFree.tip1")}</li>
        <li>{t(locale, "guides.epicFree.tip2")}</li>
        <li>{t(locale, "guides.epicFree.tip3")}</li>
      </ul>
    </GuideLayout>
  );
}
