import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("whenToBuyGuide", locale, { path: "/guides/when-to-buy" });
}

export default async function WhenToBuyGuidePage() {
  const locale = await getServerLocale();

  return (
    <GuideLayout
      slug="when-to-buy"
      title={t(locale, "guides.whenToBuy.title")}
      subtitle={t(locale, "guides.whenToBuy.subtitle")}
      readMinutes={4}
      cta={{ href: "/guides/sale-calendar", label: t(locale, "guides.whenToBuy.cta") }}
    >
      <p>{t(locale, "guides.whenToBuy.p1")}</p>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.whenToBuy.h2buy")}</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.whenToBuy.buy1")}</li>
        <li>{t(locale, "guides.whenToBuy.buy2")}</li>
        <li>{t(locale, "guides.whenToBuy.buy3")}</li>
      </ul>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.whenToBuy.h2wait")}</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.whenToBuy.wait1")}</li>
        <li>{t(locale, "guides.whenToBuy.wait2")}</li>
        <li>{t(locale, "guides.whenToBuy.wait3")}</li>
      </ul>
      <p>
        {t(locale, "guides.whenToBuy.p2")}{" "}
        <Link href="/profile" className="text-[#66c0f4] hover:underline">
          {t(locale, "guides.whenToBuy.profileLink")}
        </Link>
        .
      </p>
    </GuideLayout>
  );
}
