import { expect, test } from "@playwright/test";

test("a lista mostra cada projeto com nome e autores", async ({ page }) => {
  await page.goto("/projetos/");
  const projects = page.getByTestId("project");
  await expect(projects).not.toHaveCount(0);
  for (const project of await projects.all()) {
    await expect(project.getByRole("heading", { level: 2 })).not.toBeEmpty();
    await expect(project.getByText(/^Por \S+/)).toBeVisible();
  }
});
