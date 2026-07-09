import { runCatalogSync } from "../src/lib/services/catalog-sync";

async function main() {
  console.log("Katalog senkronizasyonu başlıyor...");
  const result = await runCatalogSync({ forceSteam: process.argv.includes("--force") });
  console.log("Tamamlandı:", result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
