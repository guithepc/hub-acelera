import { expect, test, type Page } from "@playwright/test";

test.skip(({ isMobile }) => isMobile, "navegação por teclado é de desktop");

async function tabThrough(page: Page, limit = 60): Promise<string[]> {
  const seen = new Set<string>();
  for (let step = 0; step < limit; step++) {
    await page.keyboard.press("Tab");
    const href = await page.evaluate(() => document.activeElement?.getAttribute("href"));
    if (href) seen.add(href);
  }
  return [...seen];
}

test("na entrada, o foco começa na ignição e não escapa para trás dela", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Ignição" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Entrar sem contagem" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Ignição" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("entry-gate")).toHaveAttribute("data-phase", "open");
});

test("só com o teclado dá para chegar em todo projeto, a partir da home", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Ignição" })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("entry-gate")).toHaveAttribute("data-phase", "open");
  const expected = await page
    .getByTestId("project")
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(expected.length).toBeGreaterThan(0);
  const reached = await tabThrough(page);
  for (const href of expected) expect(reached).toContain(href);
});

test("só com o teclado dá para chegar em todo link e contato de cada projeto", async ({ page }) => {
  await page.goto("/projetos/");
  const pages = await page
    .getByTestId("project")
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  for (const path of pages) {
    await page.goto(path);
    const expected = await page
      .locator('main a[target="_blank"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(expected.length).toBeGreaterThan(0);
    const reached = await tabThrough(page);
    for (const href of expected) expect(reached, `${path} → ${String(href)}`).toContain(href);
  }
});

test("Enter em um projeto focado abre a página dele", async ({ page }) => {
  await page.goto("/projetos/");
  const first = page.getByTestId("project").getByRole("link").first();
  const href = await first.getAttribute("href");
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`${href ?? "sem-href"}$`));
});
