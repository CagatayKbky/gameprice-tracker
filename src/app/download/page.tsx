import type { Metadata } from "next";
import Link from "next/link";
import { Download, Smartphone, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Android Uygulaması İndir",
  description: "GamePrice Android APK — oyun fiyat takibi, indirimler ve alarmlar.",
  alternates: { canonical: "https://gameprice.org/download" },
};

const APK_URL =
  "https://github.com/CagatayKbky/gameprice-tracker/releases/download/apk-latest/gameprice.apk";

export default function DownloadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
          <Smartphone className="w-7 h-7 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">GamePrice Android</h1>
          <p className="text-muted mt-2">
            Play Store olmadan APK ile yükle. Uygulama gameprice.org üzerinden çalışır — her zaman güncel.
          </p>
        </div>
      </div>

      <a
        href={APK_URL}
        className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-accent text-white font-semibold hover:opacity-90 transition-opacity mb-8"
      >
        <Download className="w-5 h-5" />
        APK İndir (Android)
      </a>

      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {[
          { icon: Zap, title: "Hızlı erişim", desc: "Ana ekrandan tek dokunuşla aç" },
          { icon: Shield, title: "Güvenli", desc: "Resmi gameprice.org bağlantısı" },
          { icon: Smartphone, title: "Mobil UX", desc: "Alt menü ve tam ekran deneyim" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-4">
            <Icon className="w-5 h-5 text-accent mb-2" />
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Kurulum adımları</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted">
          <li>Yukarıdaki butondan APK dosyasını indir</li>
          <li>Android ayarlarından &quot;Bilinmeyen kaynaklardan yükleme&quot;ye izin ver</li>
          <li>İndirilen <code className="text-foreground">gameprice.apk</code> dosyasına dokun</li>
          <li>Kurulumu tamamla ve GamePrice&apos;ı aç</li>
        </ol>
        <p className="text-xs text-muted">
          Chrome kullanıyorsan PWA olarak da kurabilirsin: menü → &quot;Uygulamayı yükle&quot;.
        </p>
      </section>

      <p className="text-sm text-muted mt-8">
        <Link href="/about" className="text-accent hover:underline">
          Hakkında
        </Link>
        {" · "}
        <Link href="/settings" className="text-accent hover:underline">
          Ayarlar
        </Link>
      </p>
    </div>
  );
}
