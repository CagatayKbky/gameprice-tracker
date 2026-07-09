import { syncMeilisearchCatalog } from "../src/lib/services/meilisearch-sync";

async function main() {
  console.log("Meilisearch indeks senkronizasyonu başlıyor...");
  const result = await syncMeilisearchCatalog();
  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }
  console.log("Tamamlandı:", result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
