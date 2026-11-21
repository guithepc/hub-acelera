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
  await page.getByRole("button", { name: "Ignição" }).click();
  await expect(gate(page)).toHaveAttribute("data-phase", "open");
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
