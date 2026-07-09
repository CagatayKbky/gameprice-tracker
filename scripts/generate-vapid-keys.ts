#!/usr/bin/env npx tsx
/**
 * VAPID anahtarları oluşturur — çıktıyı .env dosyanıza ekleyin.
 * Kullanım: npm run vapid:generate
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("\n# Web Push VAPID anahtarları — .env dosyanıza ekleyin:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:hello@yourdomain.com\n`);
