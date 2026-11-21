import { expect, test, type Page } from "@playwright/test";

const gate = (page: Page) => page.getByTestId("entry-gate");

async function canvasInk(page: Page): Promise<string> {
  return page.getByTestId("warp-field").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
}

test("a home tem o nome do hub como título", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Hub Acelera");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("HubAcelera");
});

test("na primeira visita a tela de entrada aparece e a ignição leva ao hero", async ({ page }) => {
  await page.goto("/");
  await expect(gate(page)).toHaveAttribute("data-phase", "closed");
  await expect(gate(page)).toBeInViewport();
  await page.getByRole("button", { name: "Ignição" }).click();
  await expect(gate(page)).toHaveAttribute("data-phase", "counting");
  await expect(gate(page)).toHaveAttribute("data-phase", "open");
  await expect(page.getByRole("link", { name: /Ver projetos/ })).toBeVisible();
  await page.getByRole("link", { name: /Ver projetos/ }).click();
  await expect(page).toHaveURL(/#projetos$/);
});

test("dá para entrar sem contagem, e a entrada não volta na mesma sessão", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar sem contagem" }).click();
  await expect(gate(page)).toHaveAttribute("data-phase", "open");
  await page.reload();
  await expect(gate(page)).toBeHidden();
});

test("a chamada do hero leva à lista de projetos na própria home", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar sem contagem" }).click();
  await page.getByRole("link", { name: /Ver projetos/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Projetos" })).toBeInViewport();
  await expect(page.getByTestId("project")).not.toHaveCount(0);
});

test("o campo de estrelas se move sozinho, sem mouse", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar sem contagem" }).click();
  await expect(page.getByTestId("warp-field")).toHaveAttribute("data-animated", "true");
  const before = await canvasInk(page);
  await expect.poll(() => canvasInk(page)).not.toBe(before);
});

test("com movimento reduzido não há contagem nem animação, e a home continua usável", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Ignição" })).toBeFocused();
  await gate(page).evaluate((element) => {
    const seen: string[] = [];
    new MutationObserver(() => seen.push(element.dataset.phase ?? "")).observe(element, {
      attributeFilter: ["data-phase"],
    });
    (window as unknown as { phases: string[] }).phases = seen;
  });
  await page.getByRole("button", { name: "Ignição" }).click();
  await expect(gate(page)).toHaveAttribute("data-phase", "open");
  expect(await page.evaluate(() => (window as unknown as { phases: string[] }).phases)).toEqual([
    "open",
  ]);
  await expect(page.getByTestId("warp-field")).toHaveAttribute("data-animated", "false");
  const before = await canvasInk(page);
  await page.waitForTimeout(400);
  expect(await canvasInk(page)).toBe(before);
  await page.getByRole("link", { name: /Ver projetos/ }).click();
  await expect(page.getByTestId("project").first()).toBeInViewport();
});

test("a rota antiga do protótipo não existe mais", async ({ page }) => {
  const response = await page.goto("/prototipo/");
  expect(response?.status()).toBe(404);
});

test("a home não rola para o lado", async ({ page }) => {
  await page.goto("/");
  const scrollsSideways = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(scrollsSideways).toBe(false);
});

test("sem JavaScript, a entrada não cobre o conteúdo", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(gate(page)).toBeHidden();
  await page.getByRole("link", { name: /Ver projetos/ }).click();
  await expect(page.getByTestId("project").first()).toBeVisible();
  const overflow = await page.locator("html").evaluate((html) => getComputedStyle(html).overflowY);
  expect(overflow).not.toBe("hidden");
  await context.close();
});

test("a página não rola atrás da entrada, e entrar mostra o hero", async ({ page, isMobile }) => {
  test.skip(isMobile, "roda do mouse é de desktop");
  await page.goto("/");
  await expect(gate(page)).toHaveAttribute("data-phase", "closed");
  await page.mouse.wheel(0, 1500);
  await page.keyboard.press("PageDown");
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole("button", { name: "Entrar sem contagem" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test("a entrada sai com a animação antes de sumir", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar sem contagem" }).click();
  await expect(gate(page)).toHaveAttribute("data-phase", "open");
  const display = () => gate(page).evaluate((element) => getComputedStyle(element).display);
  expect(await display()).not.toBe("none");
  await expect.poll(display, { timeout: 3000 }).toBe("none");
});

test("a entrada não volta ao chegar na home por um link, depois de recarregar outra página", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar sem contagem" }).click();
  await expect(gate(page)).toHaveAttribute("data-phase", "open");
  await page.goto("/projetos/");
  await page.getByRole("link", { name: /Acelera Dev \/ Hub/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("HubAcelera");
  await expect(gate(page)).toBeHidden();
});
