import { describe, it, expect } from "vitest";
import { t } from "@/lib/i18n/translations";

describe("i18n translations", () => {
  it("returns Turkish strings", () => {
    expect(t("tr", "nav.home")).toBe("Ana Sayfa");
  });

  it("returns English strings", () => {
    expect(t("en", "nav.home")).toBe("Home");
  });

  it("falls back to key for missing translations", () => {
    expect(t("en", "nonexistent.key")).toBe("nonexistent.key");
  });
});

describe("cron auth", () => {
  it("allows dev without secret", async () => {
    const { authorizeCron } = await import("@/lib/cron-auth");
    const req = new Request("http://localhost/api/cron/sync-prices");
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    delete process.env.CRON_SECRET;
    expect(authorizeCron(req as never)).toBe(true);
    process.env.NODE_ENV = original;
  });
});
