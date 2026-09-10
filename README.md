# Portfolio

Personal site for Princewill Egbujor — and a working example of a CI/CD pipeline
that deploys one build artifact to two different hosts.

Vite + TypeScript + Tailwind v4. No framework runtime; the whole page ships about
2.5 kB of JavaScript.

## Running it locally

```bash
npm ci
npm run dev
```

| Script                            | What it does                                   |
| --------------------------------- | ---------------------------------------------- |
| `npm run dev`                     | Dev server with hot reload on `localhost:5173` |
| `npm run build`                   | Production build into `dist/`                  |
| `npm run preview`                 | Serve `dist/` locally, as production would     |
| `npm run typecheck`               | `tsc --noEmit`                                 |
| `npm run lint`                    | ESLint                                         |
| `npm run format` / `format:check` | Prettier write / verify                        |
| `npm test`                        | Vitest                                         |

Run the full set of checks CI runs, before pushing:

```bash
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
```

## The pipeline

Everything lives in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

```
push / PR
   │
   ├─ quality ──> build ──┬──> deploy-pages   (push to main only)
   │                      └──> deploy-fly     (push to main only)
```

**quality** — formatting, lint, types, unit tests. Fails fast and cheap.

**build** — runs `vite build` once and uploads `dist/` as a workflow artifact.

**deploy-pages / deploy-fly** — both _download the same artifact_. Neither
rebuilds. That is the point: what's on Fly.io is byte-identical to what's on
GitHub Pages, because it is literally the same bytes.

Pull requests run `quality` and `build` but skip both deploys, gated on
`github.event_name == 'push'`.

### Why the deploys don't fight over the site's base path

GitHub Pages serves a project repo from `/<repo-name>/`, while Fly.io serves from
`/`. An absolute asset path like `/assets/index.js` works on exactly one of them.

`vite.config.ts` sets `base: './'`, so every asset reference is relative and the
same build works at either mount point. `tests/markup.test.ts` asserts no
absolute paths creep back in.

## Deploy targets

**GitHub Pages** authenticates via OIDC (`id-token: write`) — no stored token.
Enable it once under Settings → Pages → Source → _GitHub Actions_.

**Fly.io** serves `dist/` from a Caddy container ([`Dockerfile`](Dockerfile),
[`Caddyfile`](Caddyfile), [`fly.toml`](fly.toml)). The Dockerfile compiles
nothing — it copies the artifact CI already built. Machines suspend when idle
and cold-start on request.

### One-time setup

```bash
flyctl launch --no-deploy --copy-config --name princewill-portfolio
```

Then create a deploy token and add it to the repo:

```bash
flyctl tokens create deploy -x 8760h
```

Paste the result into Settings → Secrets and variables → Actions as
`FLY_API_TOKEN`.

## Tests

`tests/markup.test.ts` checks invariants that break silently in production:
dangling `#anchor` links, images without `alt` or dimensions, `target="_blank"`
without `rel="noopener"`, absolute asset paths, missing SEO metadata.

It also guards content that must not silently regress: the current employers
from the résumé, all five company logos in the marquee, and the absence of any
leftover design-mockup badge.

`tests/behaviour.test.ts` covers the scripted behaviour — the mobile menu
opening and closing, the footer year stamp, and the marquee's requirement that
the logo set be duplicated an even number of times (the CSS shifts the track by
-50%, so an odd count would make the loop visibly jump).

## Content

Resume content lives in `index.html` and mirrors
`public/Princewill_Egbujor_Resume.pdf`. Update both together.
