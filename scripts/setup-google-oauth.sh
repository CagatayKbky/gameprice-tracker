#!/usr/bin/env bash
# GamePrice — Google OAuth → Vercel kurulumu
# Kullanım: ./scripts/setup-google-oauth.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo ""
echo "=== GamePrice Google OAuth Kurulumu ==="
echo ""
echo "Google Cloud'da şunları yap (tek seferlik):"
echo "  1. https://console.cloud.google.com/apis/credentials/consent?project=tryit"
echo "     → External → App adı: GamePrice → Test user: kabakayas@gmail.com"
echo "  2. https://console.cloud.google.com/apis/credentials?project=tryit"
echo "     → Create credentials → OAuth client ID → Web application"
echo "     → Redirect URI: https://gameprice.org/api/auth/google/callback"
echo ""
read -r -p "GOOGLE_CLIENT_ID: " CLIENT_ID
read -r -s -p "GOOGLE_CLIENT_SECRET: " CLIENT_SECRET
echo ""

if [[ -z "$CLIENT_ID" || -z "$CLIENT_SECRET" ]]; then
  echo "Hata: ID ve secret boş olamaz."
  exit 1
fi

echo "$CLIENT_ID" | npx vercel env add GOOGLE_CLIENT_ID production
echo "$CLIENT_SECRET" | npx vercel env add GOOGLE_CLIENT_SECRET production

echo ""
echo "Vercel'e eklendi. Production deploy başlatılıyor..."
npm run deploy

echo ""
echo "Tamam! https://gameprice.org/settings → Google ile Giriş"
