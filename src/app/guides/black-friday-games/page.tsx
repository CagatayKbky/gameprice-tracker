import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("blackFridayGuide", locale, { path: "/guides/black-friday-games" });
}

export default async function BlackFridayGuidePage() {
  const locale = await getServerLocale();

  return (
    <GuideLayout
      slug="black-friday-games"
      title={t(locale, "guides.blackFriday.title")}
      subtitle={t(locale, "guides.blackFriday.subtitle")}
      readMinutes={5}
      cta={{ href: "/deals", label: t(locale, "guides.blackFriday.cta") }}
    >
      <p>{t(locale, "guides.blackFriday.p1")}</p>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.blackFriday.h2tips")}</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.blackFriday.tip1")}</li>
        <li>{t(locale, "guides.blackFriday.tip2")}</li>
        <li>{t(locale, "guides.blackFriday.tip3")}</li>
      </ul>
    </GuideLayout>
  );
}
