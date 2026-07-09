import fs from "fs";
import path from "path";

function loadEnvFile(filename) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key === "DATABASE_URL" && value) {
      process.env.DATABASE_URL = value;
    }
  }
}

// .env.local overrides .env (matches Next.js precedence)
loadEnvFile(".env");
loadEnvFile(".env.local");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const databaseUrl = process.env.DATABASE_URL || "";
const provider = databaseUrl.startsWith("postgres") ? "postgresql" : "sqlite";

let content = fs.readFileSync(schemaPath, "utf8");
const updated = content.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${provider}"`
);

if (content !== updated) {
  fs.writeFileSync(schemaPath, updated);
}

console.log(`[prisma] datasource provider → ${provider}`);
