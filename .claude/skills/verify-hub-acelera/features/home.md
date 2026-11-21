# Home

The entry page of the hub at `/`.

## Sub-features

- Entry gate: a full-screen overlay with a countdown. "Ignição" counts 3 to 0 and opens. "Entrar sem contagem" opens at once. It shows once per browser session.
- Hero: giant title over a star field drawn on a canvas. The cursor steers the vanishing point and fast movement accelerates. With no pointer it drifts on its own.
- "Ver projetos" scrolls to the project list on the same page.
- Project list section, the same component as `/projetos/`.
- Reduced motion: no countdown, the star field is drawn once and stays still.

## How to get to it (user POV)

Open the site root. Click "Ignição" or "Entrar sem contagem".

## Driving it with shot.mjs and Playwright

```bash
node .claude/skills/verify-hub-acelera/scripts/shot.mjs / docs/evidence/<ISSUE-ID>/entrada.png
node .claude/skills/verify-hub-acelera/scripts/shot.mjs / docs/evidence/<ISSUE-ID>/hero.png \
  --click='role=button[name="Entrar sem contagem"]' --wait=2500
```

`e2e/home.spec.ts` covers the gate, the session memory, the path to the list, the canvas animating on its own, reduced motion and the removed prototype route.

Stable handles: `data-testid="entry-gate"` with `data-phase` (`closed`, `counting`, `open`), `data-testid="warp-field"` with `data-animated`.

Proof that the star field animates: two `canvas.toDataURL()` reads differ. Proof that it is still under reduced motion: two reads 400 ms apart are equal.

## Gotchas

- Every screenshot of the hero needs the gate opened first, or it captures the gate.
- The gate is remembered in `sessionStorage`. A new browser context shows it again. A reload in the same context does not.
- Screenshots do not prove the animation is smooth. Frame rate is measured in the performance task.
