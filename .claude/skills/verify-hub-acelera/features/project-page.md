# Project page

One page per project at `/projetos/<slug>/`, generated from `content/projects/<slug>.json`.

## Sub-features

- Header with name, tagline and links to the live project and the repo.
- Cover, description, highlights, stack and optional screenshots.
- "Quem construiu": one card per author with public contacts. Contacts open in a new tab.
- Previous and next project, and a link back to the list.
- Own title, description and share image (`og:` and `twitter:` meta tags).
- 404 page for a slug that does not exist.

## How to get to it (user POV)

Open the list at `/projetos/` and click a project. On touch, tap twice.

## Driving it with shot.mjs and Playwright

```bash
node .claude/skills/verify-hub-acelera/scripts/shot.mjs /projetos/<slug>/ docs/evidence/<ISSUE-ID>/projeto.png --full
curl -s http://localhost:3100/projetos/<slug>/ | grep -oE '<meta (property|name)="(og|twitter):[^>]*>'
```

`e2e/project-page.spec.ts` reads the first file in `content/projects/` and checks every block against it, the contact links, the meta tags, the neighbors, the 404 and the navigation from the list.

Proof: every field of the JSON file is visible on the page, each external link has `target="_blank"` and `rel="noopener noreferrer"`, and `og:image` is an absolute URL that returns 200.

## Gotchas

- `og:image` is built from `SITE_URL` at build time. Without it the URL points to `http://localhost:3100`. Set `SITE_URL` to the public domain in the production build.
- Social networks do not render SVG share images. Real projects need a PNG or JPG cover.
- `shot.mjs` exits 1 on the 404 page because the browser logs the 404 as a console error. That is expected there.
