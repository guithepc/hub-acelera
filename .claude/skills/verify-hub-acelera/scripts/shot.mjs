#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import { chromium, devices } from "@playwright/test";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    base: { type: "string", default: "http://localhost:3100" },
    mobile: { type: "boolean", default: false },
    "reduced-motion": { type: "boolean", default: false },
    hover: { type: "string" },
    click: { type: "string" },
    focus: { type: "string" },
    wait: { type: "string", default: "600" },
    full: { type: "boolean", default: false },
  },
});

const [path, out] = positionals;
if (!path || !out) {
  console.error(
    "uso: shot.mjs <rota> <saida.png> [--mobile] [--reduced-motion] [--hover sel] [--click sel] [--focus sel] [--wait ms] [--full] [--base url]",
  );
  process.exit(2);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  ...(values.mobile ? devices["Pixel 7"] : { viewport: { width: 1440, height: 900 } }),
  reducedMotion: values["reduced-motion"] ? "reduce" : "no-preference",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

const response = await page.goto(new URL(path, values.base).href, { waitUntil: "networkidle" });
if (values.click) await page.locator(values.click).first().click();
if (values.hover) await page.locator(values.hover).first().hover();
if (values.focus) await page.locator(values.focus).first().focus();
await page.waitForTimeout(Number(values.wait));

mkdirSync(dirname(out), { recursive: true });
await page.screenshot({ path: out, fullPage: values.full });
console.log(
  JSON.stringify({
    url: page.url(),
    status: response?.status() ?? null,
    title: await page.title(),
    h1: await page
      .locator("h1")
      .first()
      .textContent()
      .catch(() => null),
    scrollsSideways: await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
    errors,
    out,
  }),
);
await browser.close();
process.exit(errors.length > 0 ? 1 : 0);
