---
name: verify-hub-acelera
description: Drives the Hub Acelera static site (Next.js export) in a real browser and captures screenshots as proof. Use after any visible change to the home, the project list, a project page or the about section, and before opening a PR that touches UI.
---

# Verify Hub Acelera

The app is a static site. The surface a user touches is the web UI. There is no backend, no auth and no database. Verification runs against the production build in `out/`, the same files that get deployed.

## Launch

```bash
npm ci
npm run build
npm run preview > /tmp/hub-acelera-preview.log 2>&1 &
echo $! > /tmp/hub-acelera-preview.pid
```

Ready when `curl -sf http://localhost:3100/ >/dev/null` succeeds. Rebuild after every source change. The preview serves files and does not rebuild.

Port 3100 is fixed in `package.json` and `playwright.config.ts`. Two instances cannot share it. If the port is taken by a server you did not start, stop and report it.

## Doctor

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3100/
ls -la out/index.html
git log -1 --format=%cd
```

Expect `200`, and an `out/index.html` newer than your last source edit. An older file means you are driving a stale build.

## Drive

Use the helper. It opens a route in headless Chromium, performs one optional interaction, saves a screenshot and prints a JSON line with the final URL, HTTP status, title, first `h1`, whether the page scrolls sideways, and any console or page errors. It exits 1 when the page logged errors.

```bash
node .claude/skills/verify-hub-acelera/scripts/shot.mjs <route> <out.png> \
  [--mobile] [--reduced-motion] [--hover <selector>] [--click <selector>] \
  [--focus <selector>] [--wait <ms>] [--full] [--base <url>]
```

Examples:

```bash
node .claude/skills/verify-hub-acelera/scripts/shot.mjs / docs/evidence/PCT-21/home-desktop.png
node .claude/skills/verify-hub-acelera/scripts/shot.mjs / docs/evidence/PCT-21/home-mobile.png --mobile
```

Prefer role and text selectors (`role=link[name="..."]`, `text=...`) and `data-testid` attributes over CSS classes. For flows with more than one interaction, write a Playwright spec in `e2e/` and run `npm run test:e2e`. A spec that proves a user-visible behavior stays in the repo.

## Evidence

Save screenshots to `docs/evidence/<ISSUE-ID>/` and commit them with the change. Reference them in the PR and in the Linear issue.

Proof standards:

- Drive the built site through the user path. Do not assert on component internals.
- Capture the state after the action, and the state before it when the change is a transition (hover, click, focus).
- Capture desktop and `--mobile` for every visible change.
- For anything animated, also capture `--reduced-motion`.
- A screenshot proves layout. It does not prove motion is smooth. Say so when smoothness was not measured.

## Cleanup

```bash
kill "$(cat /tmp/hub-acelera-preview.pid)" && rm /tmp/hub-acelera-preview.pid
```

Kill only the PID you started. Evidence in `docs/evidence/` stays.

## Feature map

See [features/README.md](features/README.md). Add a file there for each new user-facing feature in the same PR that ships it.
