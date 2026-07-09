# GamePrice

Türkçe/İngilizce çoklu platform oyun fiyat takip uygulaması. Steam, Epic, GOG, Xbox, PlayStation ve Nintendo fiyatlarını karşılaştırın; indirimleri takip edin, fiyat alarmı kurun.

## Özellikler

- **135.000+ oyun kataloğu** — Steam listesi + opsiyonel RAWG zenginleştirme
- **Çoklu platform fiyatları** — Steam TR, CheapShark, Epic/GOG API, Xbox/PS/Nintendo
- **İstek listesi & alarmlar** — E-posta, web push, Discord, Telegram bildirimleri
- **Steam OpenID + magic link** girişi
- **TR/EN i18n**, açık/koyu tema, USD/TRY/EUR
- **PWA** — offline önbellek, ana ekrana ekleme
- **Admin paneli** — katalog/fiyat senkronu, job logları
- **SEO** — sitemap, RSS, JSON-LD

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
| `RESEND_API_KEY` | E-posta (alarmlar, magic link, haftalık özet) |
| `NEXT_PUBLIC_VAPID_*` | Web push (`npm run vapid:generate`) |
| `TELEGRAM_BOT_TOKEN` | Telegram bildirimleri |
| `ADMIN_SECRET` | `/admin` paneli |
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

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run catalog:sync` | Katalog senkronu |
| `npm run vapid:generate` | VAPID anahtarları |
| `npm run db:studio` | Prisma Studio |

## Lisans

Private — GamePrice Tracker MVP
