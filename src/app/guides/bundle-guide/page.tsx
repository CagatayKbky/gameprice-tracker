import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("bundleGuide", locale, { path: "/guides/bundle-guide" });
}

export default async function BundleGuidePage() {
  const locale = await getServerLocale();

  return (
    <GuideLayout
      slug="bundle-guide"
      title={t(locale, "guides.bundles.title")}
      subtitle={t(locale, "guides.bundles.subtitle")}
      readMinutes={4}
      cta={{ href: "/bundles", label: t(locale, "guides.bundles.cta") }}
    >
      <p>{t(locale, "guides.bundles.p1")}</p>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.bundles.h2tips")}</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.bundles.tip1")}</li>
        <li>{t(locale, "guides.bundles.tip2")}</li>
        <li>{t(locale, "guides.bundles.tip3")}</li>
      </ul>
    </GuideLayout>
  );
}
