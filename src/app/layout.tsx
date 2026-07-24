import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/constants";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { ToastProvider, AlertChecker } from "@/components/providers/ToastProvider";
import { CompareProvider } from "@/components/providers/CompareProvider";
import { RecentlyViewedProvider } from "@/components/providers/RecentlyViewedProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { PremiumProvider } from "@/components/providers/PremiumProvider";
import { CompareFloatingBar } from "@/components/games/CompareFloatingBar";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { CapacitorBridge } from "@/components/capacitor/CapacitorBridge";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GamePrice — Oyun Fiyat Takip",
    template: "%s | GamePrice",
  },
  description:
    "135.000+ oyun. Steam, Epic, Xbox, PlayStation fiyat karşılaştırması, indirim takibi, fiyat alarmları ve Türkiye Steam fiyatları.",
  keywords: [
    "oyun fiyat",
    "steam indirim",
    "epic games",
    "xbox",
    "playstation",
    "fiyat takip",
    "oyun indirim",
    "türkiye steam fiyat",
    "oyun fiyat karşılaştırma",
    "steam fiyat takip",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "GamePrice İndirimleri" }],
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    siteName: SITE_NAME,
    title: "GamePrice — Oyun Fiyat Takip",
    description:
      "Tüm platformlarda en ucuz oyun fiyatını bul. İndirim takibi ve fiyat alarmları.",
    url: SITE_URL,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GamePrice — Oyun Fiyat Takip",
    description: "Steam, Epic, Xbox fiyat karşılaştırması ve indirim takibi.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_SITE_VERIFICATION,
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#66c0f4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} min-h-screen flex flex-col font-sans`}
      >
        <ThemeProvider>
        <LocaleProvider>
        <PremiumProvider>
        <CurrencyProvider>
          <CompareProvider>
            <RecentlyViewedProvider>
            <ToastProvider>
              <AlertChecker />
              <Header />
              <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
              <CompareFloatingBar />
              <PwaRegister />
              <PwaInstallPrompt />
              <CapacitorBridge />
              <OnboardingModal />
            </ToastProvider>
            </RecentlyViewedProvider>
          </CompareProvider>
        </CurrencyProvider>
        </PremiumProvider>
        </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
