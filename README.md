# hiwushuang.me — personal homepage

Static personal site for **陈璐 · mocca** ([hiwushuang.me](https://hiwushuang.me)). Pure HTML/CSS with a small motion script for parallax and scroll reveal.

## Cloudflare Pages

| Setting | Value |
| --- | --- |
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (repository root) |
| **Node version** | 20 or later |

## Local preview

```bash
npm run build
python3 -m http.server 8787 --directory dist
# open http://127.0.0.1:8787/
```

You can also open `index.html` from the repo root while editing (CSS/JS paths are relative).

## Repository layout

| Path | Role |
| --- | --- |
| `index.html` | Page structure and accessibility hooks |
| `tokens.css` / `base.css` / `styles.css` | Design system and layout |
| `assets/scenery/mountains.svg` | Layered hill/mist artwork for the meadow backdrop |
| `assets/icons/social/` | Social icons |
| `scripts/meadow.js` | Parallax, scroll reveal, year (skips motion when `prefers-reduced-motion`) |
| `scripts/build.mjs` | Copies deployable files into `dist/` |

## Design (meadow light, 2026)

**Goal:** Bright, high-contrast reading on a **green meadow / open sky** atmosphere—not a dark UI or a flat green filter.

| Decision | Rationale |
| --- | --- |
| **Light palette** | Near-black green text (`#152318`) on frosted white panels (82–92% opacity + blur) |
| **Scenery layers** | Sky gradient, drifting clouds, SVG mountains/mist, foreground grass sway |
| **Typography** | **Noto Serif SC** headings + **Noto Sans SC** body + **IBM Plex Mono** labels |
| **Motion** | Cloud drift, sun glow, grass sway, scroll parallax, section reveal; disabled under `prefers-reduced-motion` |
| **Content** | Same identity, placeholders, and social URLs—no fabricated projects |
