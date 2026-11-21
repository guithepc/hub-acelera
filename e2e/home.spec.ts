import { expect, test } from "@playwright/test";

test("a home abre e mostra o nome do hub", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Hub Acelera");
  await expect(page.getByRole("heading", { level: 1, name: "Hub Acelera" })).toBeVisible();
});
