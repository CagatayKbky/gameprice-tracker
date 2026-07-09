import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("steamTurkeyGuide", locale, { path: "/guides/steam-turkey-prices" });
}

export default async function SteamTurkeyGuidePage() {
  const locale = await getServerLocale();

  return (
    <GuideLayout
      slug="steam-turkey-prices"
      title={t(locale, "guides.steamTurkey.title")}
      subtitle={t(locale, "guides.steamTurkey.subtitle")}
      readMinutes={5}
      cta={{ href: "/deals?tab=all&store=steam", label: t(locale, "guides.steamTurkey.cta") }}
    >
      <p>{t(locale, "guides.steamTurkey.p1")}</p>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.steamTurkey.h2why")}</h2>
      <p>{t(locale, "guides.steamTurkey.p2")}</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.steamTurkey.point1")}</li>
        <li>{t(locale, "guides.steamTurkey.point2")}</li>
        <li>{t(locale, "guides.steamTurkey.point3")}</li>
      </ul>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.steamTurkey.h2how")}</h2>
      <p>{t(locale, "guides.steamTurkey.p3")}</p>
      <p>
        <Link href="/search" className="text-[#66c0f4] hover:underline">
          {t(locale, "guides.steamTurkey.searchLink")}
        </Link>{" "}
        {t(locale, "guides.steamTurkey.p4")}
      </p>
    </GuideLayout>
  );
}
