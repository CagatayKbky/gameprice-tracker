import { SITE_NAME, SITE_URL } from "@/lib/seo/constants";
import type { GuideSlug } from "@/lib/guides/catalog";

export function buildArticleJsonLd(params: {
  slug: GuideSlug;
  title: string;
  description: string;
  datePublished?: string;
}) {
  const url = `${SITE_URL}/guides/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url,
    mainEntityOfPage: url,
    datePublished: params.datePublished || "2026-01-15",
    dateModified: new Date().toISOString().slice(0, 10),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-192.png`,
      },
    },
  };
}

export function buildGuidesBreadcrumbJsonLd(slug: string, title: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Rehberler", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/guides/${slug}` },
    ],
  };
}
