import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const dir = join(process.cwd(), "content", "projects");
const files = readdirSync(dir).filter((name) => name.endsWith(".json"));
const first = files[0];
if (!first) throw new Error("nenhum projeto em content/projects");
const slug = first.replace(/\.json$/, "");
const project = JSON.parse(readFileSync(join(dir, first), "utf8")) as {
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  cover: string;
  links: { site?: string; repo?: string };
  authors: { name: string; contacts?: { url: string }[] }[];
};

test("a página mostra todos os blocos com os dados do arquivo", async ({ page }) => {
  await page.goto(`/projetos/${slug}/`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.name);
  await expect(page.getByText(project.tagline, { exact: true })).toBeVisible();
  await expect(page.getByText(project.description, { exact: true })).toBeVisible();
  for (const highlight of project.highlights) await expect(page.getByText(highlight)).toBeVisible();
  for (const technology of project.stack)
    await expect(page.getByRole("listitem").filter({ hasText: technology }).first()).toBeVisible();
  for (const author of project.authors)
    await expect(page.getByTestId("author").filter({ hasText: author.name })).toBeVisible();
  const scrollsSideways = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(scrollsSideways).toBe(false);
});

test("os links do projeto e os contatos abrem o destino certo em nova aba", async ({ page }) => {
  await page.goto(`/projetos/${slug}/`);
  const expected = [
    ...Object.values(project.links),
    ...project.authors.flatMap((author) => (author.contacts ?? []).map((contact) => contact.url)),
  ];
  expect(expected.length).toBeGreaterThan(0);
  for (const url of new Set(expected)) {
    const link = page.locator(`a[href="${url}"]`).first();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
  const target = expected[0];
  if (!target) throw new Error("sem link para clicar");
  await page.context().route(/^https?:\/\/(?!localhost)/, (route) => route.fulfill({ body: "ok" }));
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`a[href="${target}"]`).first().click(),
  ]);
  expect(popup.url()).toBe(new URL(target).href);
});

test("a página tem título, descrição e imagem de compartilhamento próprios", async ({ page }) => {
  await page.goto(`/projetos/${slug}/`);
  await expect(page).toHaveTitle(`${project.name} · Hub Acelera`);
  const meta = (property: string) => page.locator(`meta[property="${property}"]`);
  await expect(meta("og:title")).toHaveAttribute("content", project.name);
  await expect(meta("og:description")).toHaveAttribute("content", project.tagline);
  const image = await meta("og:image").getAttribute("content");
  expect(image).toMatch(/^https?:\/\//);
  expect(image).toContain(project.cover);
  const response = await page.request.get(new URL(image ?? "").pathname);
  expect(response.ok()).toBe(true);
});

test("anterior e próximo levam a outros projetos, e dá para voltar à lista", async ({ page }) => {
  test.skip(files.length < 2, "precisa de dois projetos");
  await page.goto(`/projetos/${slug}/`);
  await page.getByRole("navigation", { name: "Outros projetos" }).getByRole("link").last().click();
  await expect(page).not.toHaveURL(new RegExp(`/projetos/${slug}/$`));
  await expect(page).toHaveURL(/\/projetos\/[a-z0-9-]+\/$/);
  await page.getByRole("link", { name: /Todos os projetos/ }).click();
  await expect(page).toHaveURL(/\/projetos\/$/);
});

test("um projeto que não existe mostra o 404 com volta para a lista", async ({ page }) => {
  const response = await page.goto("/projetos/nao-existe/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página não encontrada");
  await page.getByRole("link", { name: "Ver todos os projetos" }).click();
  await expect(page).toHaveURL(/\/projetos\/$/);
});

test("na lista, clicar em um projeto abre a página dele", async ({ page, isMobile }) => {
  await page.goto("/projetos/");
  const row = page.getByTestId("project").getByRole("link").first();
  const href = await row.getAttribute("href");
  if (isMobile) {
    await row.tap();
    await expect(page).toHaveURL(/\/projetos\/$/);
    await row.tap();
  } else {
    await row.click();
  }
  await expect(page).toHaveURL(new RegExp(`${href ?? "sem-href"}$`));
});
