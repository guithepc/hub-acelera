#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.MEASURE_BASE ?? "http://localhost:3100";
const runs = Number(process.env.MEASURE_RUNS ?? 5);
const outDir = process.argv[2] ?? "docs/evidence/measure";
const pages = { home: "/", lista: "/projetos/", projeto: "/projetos/acelera-commits/" };
const presets = { desktop: ["--preset=desktop"], celular: [] };
const metrics = {
  performance: (lhr) => lhr.categories.performance.score * 100,
  acessibilidade: (lhr) => lhr.categories.accessibility.score * 100,
  seo: (lhr) => lhr.categories.seo.score * 100,
  "boas práticas": (lhr) => lhr.categories["best-practices"].score * 100,
  "LCP ms": (lhr) => lhr.audits["largest-contentful-paint"].numericValue,
  "TBT ms": (lhr) => lhr.audits["total-blocking-time"].numericValue,
  CLS: (lhr) => lhr.audits["cumulative-layout-shift"].numericValue,
  "peso KB": (lhr) => lhr.audits["total-byte-weight"].numericValue / 1024,
};

const median = (values) => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
const round = (value) => (value < 1 ? Number(value.toFixed(3)) : Math.round(value));

mkdirSync(outDir, { recursive: true });
const samples = {};
const failed = {};

for (let run = 1; run <= runs; run++) {
  for (const [page, path] of Object.entries(pages)) {
    for (const [device, flags] of Object.entries(presets)) {
      const key = `${page} · ${device}`;
      const file = join(outDir, `${page}-${device}-${String(run)}.json`);
      execFileSync(
        "npx",
        [
          "lighthouse",
          base + path,
          ...flags,
          "--quiet",
          "--output=json",
          `--output-path=${file}`,
          "--chrome-flags=--headless=new",
        ],
        { stdio: ["ignore", "ignore", "inherit"] },
      );
      const lhr = JSON.parse(readFileSync(file, "utf8"));
      if (lhr.runtimeError) throw new Error(`${key}: ${lhr.runtimeError.message}`);
      if (new URL(lhr.finalDisplayedUrl).pathname !== path)
        throw new Error(`${key}: mediu ${lhr.finalDisplayedUrl}`);
      samples[key] ??= {};
      for (const [name, read] of Object.entries(metrics))
        (samples[key][name] ??= []).push(read(lhr));
      failed[key] = Object.values(lhr.categories)
        .flatMap((category) => category.auditRefs)
        .map((ref) => lhr.audits[ref.id])
        .filter(
          (audit) =>
            audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== "informative",
        )
        .map((audit) => audit.id);
      if (run < runs) writeFileSync(file, "");
    }
  }
}

const summary = Object.fromEntries(
  Object.entries(samples).map(([key, byMetric]) => [
    key,
    Object.fromEntries(
      Object.entries(byMetric).map(([name, values]) => [
        name,
        {
          mediana: round(median(values)),
          min: round(Math.min(...values)),
          max: round(Math.max(...values)),
        },
      ]),
    ),
  ]),
);
writeFileSync(
  join(outDir, "resumo.json"),
  JSON.stringify({ base, runs, summary, failed }, null, 2) + "\n",
);

const names = Object.keys(metrics);
console.log(`| página · aparelho | ${names.join(" | ")} |`);
console.log(`|---|${names.map(() => "---").join("|")}|`);
for (const [key, byMetric] of Object.entries(summary))
  console.log(
    `| ${key} | ${names.map((name) => `${String(byMetric[name].mediana)} (${String(byMetric[name].min)}–${String(byMetric[name].max)})`).join(" | ")} |`,
  );
console.log("\nAuditorias abaixo de 0,9 na última rodada:");
for (const [key, ids] of Object.entries(failed))
  console.log(`- ${key}: ${ids.join(", ") || "nenhuma"}`);
