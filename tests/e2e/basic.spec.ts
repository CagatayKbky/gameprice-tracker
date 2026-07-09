import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=GamePrice").first()).toBeVisible();
});

test("search page works", async ({ page }) => {
  await page.goto("/search?q=cyberpunk");
  await expect(page.locator("h1")).toContainText("cyberpunk");
});

test("deals page loads", async ({ page }) => {
  await page.goto("/deals");
  await expect(page.locator("h1")).toContainText("İndirim");
});

test("browse page loads", async ({ page }) => {
  await page.goto("/browse");
  await expect(page.locator("h1")).toContainText("Katalog");
});
