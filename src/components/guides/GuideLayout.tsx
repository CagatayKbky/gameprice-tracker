import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildArticleJsonLd, buildGuidesBreadcrumbJsonLd } from "@/lib/seo/guide-schemas";
import type { GuideSlug } from "@/lib/guides/catalog";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

interface GuideLayoutProps {
  slug: GuideSlug;
  title: string;
  subtitle: string;
  readMinutes: number;
  children: React.ReactNode;
  cta?: { href: string; label: string };
}

export async function GuideLayout({
  slug,
  title,
  subtitle,
  readMinutes,
  children,
  cta,
}: GuideLayoutProps) {
  const locale = await getServerLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <JsonLd data={buildArticleJsonLd({ slug, title, description: subtitle })} />
      <JsonLd data={buildGuidesBreadcrumbJsonLd(slug, title)} />

      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-[#8f98a0]">
        <Link href="/" className="hover:text-[#66c0f4]">
          {t(locale, "nav.home")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/guides" className="hover:text-[#66c0f4]">
          {t(locale, "guides.hub.title")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">{title}</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-[#66c0f4]">
          {t(locale, "guides.hub.readTime", { minutes: String(readMinutes) })}
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-[#8f98a0]">{subtitle}</p>
      </header>

      <article className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed text-[#c6d4df]">
        {children}
      </article>

      <div className="mt-10 flex flex-wrap gap-4">
        {cta && (
          <Link
            href={cta.href}
            className="rounded-xl border border-[#2a475e]/60 bg-[#1b2838]/50 px-5 py-3 text-[#66c0f4] font-medium hover:underline"
          >
            {cta.label} →
          </Link>
        )}
        <Link href="/guides" className="rounded-xl px-5 py-3 text-sm text-[#8f98a0] hover:text-white">
          ← {t(locale, "guides.hub.title")}
        </Link>
      </div>
    </div>
  );
}
