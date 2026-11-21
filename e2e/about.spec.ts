import { expect, test } from "@playwright/test";

test("o link Sobre do cabeçalho leva à seção, a partir de qualquer página", async ({ page }) => {
  await page.goto("/projetos/");
  await page
    .getByRole("navigation", { name: "Principal" })
    .getByRole("link", { name: "Sobre" })
    .click();
  await expect(page).toHaveURL(/\/#sobre$/);
  await page.getByRole("button", { name: "Entrar sem contagem" }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: /comunidade que constrói junto/ }),
  ).toBeInViewport();
  await expect(page.getByText(/A Acelera Dev é uma comunidade/)).toBeVisible();
});

test("o link da comunidade abre o site da Acelera Dev em nova aba", async ({ page }) => {
  await page.goto("/#sobre");
  await page.getByRole("button", { name: "Entrar sem contagem" }).click();
  await page.context().route(/^https?:\/\/(?!localhost)/, (route) => route.fulfill({ body: "ok" }));
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: /Conhecer a comunidade/ }).click(),
  ]);
  expect(popup.url()).toBe("https://aceleradev.com.br/");
});

test("a seção cabe na tela sem rolar para o lado", async ({ page }) => {
  await page.goto("/#sobre");
  const scrollsSideways = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(scrollsSideways).toBe(false);
});
