# Project list

Every project in the hub, one row each, at `/projetos/`.

## Sub-features

- Row with index, name, tagline and authors.
- Floating preview that follows the mouse while it is over a row.
- Inline preview that opens under the row on keyboard focus or first tap.
- Second tap, click or Enter opens the project page.

## How to get to it (user POV)

Click "Projetos" in the header, or "Ver projetos" on the home.

## Driving it with shot.mjs and Playwright

```bash
node .claude/skills/verify-hub-acelera/scripts/shot.mjs /projetos/ docs/evidence/<ISSUE-ID>/hover.png \
  --hover='role=link[name=/<project name>/]' --wait=900
```

`e2e/projects.spec.ts` covers hover, a fast sweep over all rows, leaving the list, reduced motion, Tab focus and touch.

Stable handles: `data-testid="project"` on each row, `data-testid="floating-preview"` with `data-open`, the covers inside it with `data-cover` and `data-shown`, and `data-testid="inline-preview"` with `data-open`.

Proof: after hovering a row, `floating-preview` has `data-open="true"` and exactly one cover has `data-shown="true"`, with `data-cover` equal to that row's slug.

## Gotchas

- The preview state is driven by pointer movement after hydration. A test that moves the mouse before the page hydrates sees nothing. Hover one row and wait for `data-open="true"` first.
- The default Playwright desktop viewport is 720px tall. A mouse move to a row below the fold leaves the viewport and closes the preview. Resize the viewport before sweeping.
