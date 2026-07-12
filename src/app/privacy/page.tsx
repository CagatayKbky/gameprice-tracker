import Link from "next/link";
import { Shield } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("privacy", locale, { path: "/privacy" });
}

const sectionKeys = [
  "privacy.sections.data",
  "privacy.sections.cookies",
  "privacy.sections.thirdParty",
  "privacy.sections.rights",
  "privacy.sections.contact",
] as const;

export default async function PrivacyPage() {
  const locale = await getServerLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t(locale, "privacy.title")}</h1>
          <p className="text-sm text-muted mt-1">{t(locale, "privacy.subtitle")}</p>
        </div>
      </div>

      <p className="text-xs text-muted mb-8">{t(locale, "privacy.updated")}</p>

      <div className="space-y-8 text-sm text-muted leading-relaxed">
        {sectionKeys.map((key) => (
          <section key={key}>
            <h2 className="text-base font-semibold text-foreground mb-2">
              {t(locale, `${key}.title`)}
            </h2>
            <p>{t(locale, `${key}.body`)}</p>
          </section>
        ))}
      </div>

      <p className="text-sm text-muted mt-10">
        <Link href="/about" className="text-accent hover:underline">
          {t(locale, "footer.account.about")}
        </Link>
        {" · "}
        <Link href="/settings" className="text-accent hover:underline">
          {t(locale, "nav.settings")}
        </Link>
      </p>
    </div>
  );
}
