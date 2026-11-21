# Home

The entry page of the hub.

## Sub-features

- Site name as the page heading.
- One-line description of the hub.

## How to get to it (user POV)

Open the site root.

## Driving it with shot.mjs

```bash
node .claude/skills/verify-hub-acelera/scripts/shot.mjs / docs/evidence/<ISSUE-ID>/home-desktop.png
node .claude/skills/verify-hub-acelera/scripts/shot.mjs / docs/evidence/<ISSUE-ID>/home-mobile.png --mobile
```

Proof: status 200, title `Hub Acelera`, `h1` is `Hub Acelera`, `scrollsSideways` is false, `errors` is empty. `e2e/home.spec.ts` asserts the title and heading on both viewports.

## Gotchas

- The home is a placeholder until the immersive home ships. Update this file in that PR.
