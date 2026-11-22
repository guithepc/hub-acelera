import { expect, test, type Page } from "@playwright/test";

const rows = (page: Page) => page.getByTestId("project").getByRole("link");
const floating = (page: Page) => page.getByTestId("floating-preview");
const shownCover = (page: Page) => floating(page).locator('[data-shown="true"]');

async function slugOf(row: ReturnType<typeof rows>): Promise<string> {
  const href = await row.getAttribute("href");
  const slug = href?.split("/").filter(Boolean).at(-1);
  if (!slug) throw new Error(`link sem slug: ${String(href)}`);
  return slug;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/projetos/");
});

test("a lista mostra cada projeto com nome e autores", async ({ page }) => {
  await expect(rows(page)).not.toHaveCount(0);
  for (const row of await rows(page).all()) {
    await expect(row.locator("span.font-display")).not.toBeEmpty();
    await expect(row.getByText(/^Por \S+/)).toBeVisible();
  }
});

test.describe("com mouse", () => {
  test.skip(({ isMobile }) => isMobile, "hover só existe com mouse");

  test("passar o mouse mostra o preview daquele projeto", async ({ page }) => {
    await expect(floating(page)).toHaveAttribute("data-open", "false");
    const row = rows(page).nth(1);
    await row.hover();
    await expect(floating(page)).toHaveAttribute("data-open", "true");
    await expect(shownCover(page)).toHaveCount(1);
    await expect(shownCover(page)).toHaveAttribute("data-cover", await slugOf(row));
  });

  test("varrer todos os itens rápido termina no preview do último", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1600 });
    const all = await rows(page).all();
    await rows(page).first().hover();
    await expect(floating(page)).toHaveAttribute("data-open", "true");
    for (let lap = 0; lap < 3; lap++) {
      for (const row of all) {
        const box = await row.boundingBox();
        if (!box) throw new Error("item sem caixa");
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 2 });
      }
    }
    const last = all.at(-1);
    if (!last) throw new Error("lista vazia");
    await expect(shownCover(page)).toHaveCount(1);
    await expect(shownCover(page)).toHaveAttribute("data-cover", await slugOf(last));
  });

  test("rolar a página sem mexer o mouse troca o preview para o projeto sob o cursor", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 500 });
    const first = rows(page).first();
    await first.hover();
    await expect(shownCover(page)).toHaveAttribute("data-cover", await slugOf(first));
    const box = await first.boundingBox();
    if (!box) throw new Error("item sem caixa");
    const position = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const second = await rows(page).nth(1).boundingBox();
    if (!second) throw new Error("segundo item sem caixa");
    await page.mouse.wheel(0, second.y - box.y);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expect
      .poll(async () => {
        const under = await page.evaluate(
          ({ x, y }) =>
            document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-slug]")?.dataset.slug ??
            null,
          position,
        );
        const shown =
          (await shownCover(page).count()) === 1
            ? await shownCover(page).getAttribute("data-cover")
            : null;
        return under !== null && under === shown;
      })
      .toBe(true);
    await expect(shownCover(page)).not.toHaveAttribute("data-cover", await slugOf(first));
  });

  test("perto da borda de baixo o preview fica inteiro dentro da tela", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const row = rows(page).nth(1);
    const box = await row.boundingBox();
    if (!box) throw new Error("item sem caixa");
    await row.hover();
    await page.mouse.move(box.x + box.width / 2, Math.min(box.y + box.height - 4, 712));
    await expect
      .poll(async () => {
        const preview = await floating(page).boundingBox();
        return preview ? preview.y + preview.height : Infinity;
      })
      .toBeLessThanOrEqual(720);
  });

  test("sair da lista esconde o preview", async ({ page }) => {
    await rows(page).first().hover();
    await page.getByRole("heading", { level: 1 }).hover();
    await expect(floating(page)).toHaveAttribute("data-open", "false");
  });

  test("com movimento reduzido o preview aparece mesmo assim", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await rows(page).first().hover();
    await expect(floating(page)).toHaveAttribute("data-open", "true");
    await expect(shownCover(page)).toBeVisible();
  });

  test("Tab leva o foco a cada item e abre o preview dele", async ({ page }) => {
    const all = await rows(page).all();
    await page.getByRole("heading", { level: 1 }).click();
    for (const row of all) {
      await page.keyboard.press("Tab");
      await expect(row).toBeFocused();
      await expect(row.getByTestId("inline-preview")).toHaveAttribute("data-open", "true");
    }
  });
});

test.describe("com teclado", () => {
  test.skip(({ isMobile }) => isMobile, "teclado é de desktop");

  test("o preview aberto pelo teclado fecha quando o foco sai da lista", async ({ page }) => {
    const all = await rows(page).all();
    await page.getByRole("heading", { level: 1 }).click();
    for (const row of all) {
      await page.keyboard.press("Tab");
      await expect(row).toBeFocused();
    }
    await expect(page.locator('[data-testid="inline-preview"][data-open="true"]')).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-testid="inline-preview"][data-open="true"]')).toHaveCount(0);
  });
});

test.describe("com toque", () => {
  test.skip(({ isMobile }) => !isMobile, "toque só no celular");

  test("o primeiro toque abre o preview sem sair da lista", async ({ page }) => {
    const row = rows(page).first();
    await row.tap();
    await expect(row.getByTestId("inline-preview")).toHaveAttribute("data-open", "true");
    await expect(page).toHaveURL(/\/projetos\/$/);
  });
});
