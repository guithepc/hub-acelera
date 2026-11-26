#!/usr/bin/env node
import { chromium, devices } from "@playwright/test";

const base = process.env.MEASURE_BASE ?? "http://localhost:3100";
const runs = Number(process.env.MEASURE_RUNS ?? 5);
const seconds = 3;
const cases = [
  {
    name: "celular, CPU 4x mais lenta, sem toque",
    device: devices["Pixel 7"],
    throttle: 4,
    move: false,
  },
  {
    name: "desktop, CPU 4x mais lenta, mouse em movimento",
    device: { viewport: { width: 1440, height: 900 } },
    throttle: 4,
    move: true,
  },
  {
    name: "desktop, sem limite, mouse em movimento",
    device: { viewport: { width: 1440, height: 900 } },
    throttle: 1,
    move: true,
  },
];

const median = (values) => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
const browser = await chromium.launch();

console.log("| cenário | quadros por segundo | pior quadro (ms) | quadros acima de 33 ms |");
console.log("|---|---|---|---|");

for (const scenario of cases) {
  const results = [];
  for (let run = 0; run < runs; run++) {
    const context = await browser.newContext(scenario.device);
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await page.goto(base + "/");
    await page.getByRole("button", { name: "Entrar sem contagem" }).click();
    await page.waitForTimeout(1200);
    if ((await page.getByTestId("warp-field").getAttribute("data-animated")) !== "true")
      throw new Error("o campo de estrelas não está animando");
    await session.send("Emulation.setCPUThrottlingRate", { rate: scenario.throttle });

    const sampling = page.evaluate(
      (duration) =>
        new Promise((resolve) => {
          const gaps = [];
          let last = performance.now();
          const start = last;
          function tick(now) {
            gaps.push(now - last);
            last = now;
            if (now - start < duration) requestAnimationFrame(tick);
            else resolve(gaps.slice(1));
          }
          requestAnimationFrame(tick);
        }),
      seconds * 1000,
    );
    if (scenario.move) {
      const { width, height } = page.viewportSize();
      for (let step = 0; step < 90; step++) {
        await page.mouse.move(
          width * (0.5 + 0.4 * Math.cos(step / 4)),
          height * (0.5 + 0.35 * Math.sin(step / 3)),
        );
        await page.waitForTimeout(25);
      }
    }
    const gaps = await sampling;
    if (gaps.length < 10) throw new Error(`só ${String(gaps.length)} quadros medidos`);
    const total = gaps.reduce((sum, gap) => sum + gap, 0);
    results.push({
      fps: (gaps.length / total) * 1000,
      worst: Math.max(...gaps),
      slow: gaps.filter((gap) => gap > 33).length / gaps.length,
    });
    await context.close();
  }
  const fps = results.map((result) => result.fps);
  console.log(
    `| ${scenario.name} | ${median(fps).toFixed(0)} (${Math.min(...fps).toFixed(0)}–${Math.max(...fps).toFixed(0)}) | ${median(results.map((result) => result.worst)).toFixed(0)} | ${(median(results.map((result) => result.slow)) * 100).toFixed(1)}% |`,
  );
}
await browser.close();
