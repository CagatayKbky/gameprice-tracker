# GamePrice

Türkçe/İngilizce çoklu platform oyun fiyat takip uygulaması. Steam, Epic, GOG, Xbox, PlayStation ve Nintendo fiyatlarını karşılaştırın; indirimleri takip edin, fiyat alarmı kurun.

## Özellikler

- **135.000+ oyun kataloğu** — Steam listesi + opsiyonel RAWG zenginleştirme
- **Çoklu platform fiyatları** — Steam TR, CheapShark, Epic/GOG API, Xbox/PS/Nintendo
- **İstek listesi & alarmlar** — E-posta, web push, Discord, Telegram bildirimleri
- **Steam OpenID + Google OAuth + magic link** girişi
- **TR/EN i18n**, açık/koyu tema, USD/TRY/EUR
- **PWA** — offline önbellek, ana ekrana ekleme (iOS rehberi dahil)
- **Sosyal** — arkadaşlar, liderlik tablosu, referral, public profil paylaşımı
- **Pro** — öncelikli alarmlar, kişiselleştirilmiş haftalık özet
- **Rehberler** — SEO odaklı 7 rehber (indirim takvimi, Epic ücretsiz, bundle, Steam Deck)
- **Chrome extension 2.0** — Steam + Epic fiyat + wishlist butonu
- **Admin paneli** — Google kullanıcı listesi, katalog/fiyat senkronu, Pro/davet analitiği
- **SEO** — sitemap, RSS, JSON-LD, DLC/sürüm karşılaştırma

## Hızlı Başlangıç

```bash
npm install
cp .env.example .env
npm run db:push
npm run catalog:sync   # ~135k Steam oyunu (uzun sürebilir)
npm run dev
```

Uygulama: http://localhost:3000

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | SQLite (`file:./dev.db`) veya PostgreSQL |
| `NEXT_PUBLIC_APP_URL` | Uygulama URL'i |
| `CRON_SECRET` | **Production'da zorunlu** — cron endpoint auth |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google ile giriş |
| `GOOGLE_ADMIN_EMAILS` | Virgülle ayrılmış admin e-postaları (Google girişinde otomatik admin) |
| `RESEND_API_KEY` | E-posta (alarmlar, magic link, haftalık özet) |
| `NEXT_PUBLIC_VAPID_*` | Web push (`npm run vapid:generate`) |
| `TELEGRAM_BOT_TOKEN` | Telegram bildirimleri |
| `SENTRY_DSN` | Hata izleme |
| `MEILISEARCH_HOST` | Opsiyonel hızlı arama |
| `RAWG_API_KEY` | Katalog zenginleştirme |

## Production (Vercel + PostgreSQL)

```bash
# docker-compose.yml ile yerel Postgres
docker compose up -d
# .env içinde DATABASE_URL=postgresql://...
npm run db:push
npm run catalog:sync
```

`vercel.json` cron job'ları:
- Fiyat senkronu: 6 saatte bir
- Haftalık özet: Pazartesi 09:00 UTC
- İstek listesi indirimleri: 4 saatte bir

Cron çağrıları `Authorization: Bearer $CRON_SECRET` gerektirir (production).

## Sağlık Kontrolü

```
GET /api/health
```

## Testler

```bash
npm run test        # Vitest unit testleri
npm run test:e2e    # Playwright (dev server gerekli)
```

## Tarayıcı Eklentisi

`extension/` klasörünü Chrome'da "Paketlenmemiş uzantı yükle" ile yükleyin. Steam mağaza sayfalarında GamePrice'a hızlı erişim sağlar.

## Android APK (Capacitor)

Play Store ücreti olmadan yüklenebilir APK için Capacitor kullanılır. Uygulama `https://gameprice.org` adresini WebView içinde açar.

**Gereksinimler:** Android Studio, JDK 17+

```bash
npm install
npm run cap:sync          # android-shell → native proje
npm run cap:open          # Android Studio açar
# Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
# veya terminal:
npm run android:apk       # android/app/build/outputs/apk/debug/app-debug.apk
```

Yerel geliştirme için `CAPACITOR_SERVER_URL=http://10.0.2.2:3000 npm run cap:sync` (emülatör).

Google OAuth redirect URI'ye production URL ekleyin: `https://gameprice.org/api/auth/google/callback`

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run catalog:sync` | Katalog senkronu |
| `npm run vapid:generate` | VAPID anahtarları |
| `npm run db:studio` | Prisma Studio |
| `npm run cap:sync` | Capacitor Android senkron |
| `npm run android:apk` | Debug APK derle |

## Lisans

Private — GamePrice Tracker MVP
