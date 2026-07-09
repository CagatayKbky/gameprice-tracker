import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { ToastProvider, AlertChecker } from "@/components/providers/ToastProvider";
import { CompareProvider } from "@/components/providers/CompareProvider";
import { RecentlyViewedProvider } from "@/components/providers/RecentlyViewedProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { CompareFloatingBar } from "@/components/games/CompareFloatingBar";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
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
  ],
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: "GamePrice İndirimleri" },
      ],
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "GamePrice",
    title: "GamePrice — Oyun Fiyat Takip",
    description:
      "Tüm platformlarda en ucuz oyun fiyatını bul. İndirim takibi ve fiyat alarmları.",
  },
  appleWebApp: {
    capable: true,
    title: "GamePrice",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen flex flex-col`}>
        <ThemeProvider>
        <LocaleProvider>
        <CurrencyProvider>
          <CompareProvider>
            <RecentlyViewedProvider>
            <ToastProvider>
              <AlertChecker />
              <Header />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
              <CompareFloatingBar />
              <PwaRegister />
              <PwaInstallPrompt />
            </ToastProvider>
            </RecentlyViewedProvider>
          </CompareProvider>
        </CurrencyProvider>
        </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
