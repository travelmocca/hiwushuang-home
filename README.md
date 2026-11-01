# hiwushuang.me — personal homepage

Static personal site for **陈璐 · mocca** ([hiwushuang.me](https://hiwushuang.me)). Pure HTML/CSS with a small script for scroll reveal, nav state, and hero video (respects `prefers-reduced-motion`).

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
| `assets/scenery/meadow-loop.webm` | Hero background loop (first viewport) |
| `assets/scenery/meadow-poster.jpg` | Video poster / reduced-motion fallback |
| `assets/scenery/mountains.svg` | Decorative art in hero scene card |
| `assets/icons/social/` | Social icons |
| `scripts/meadow.js` | Hero video, nav on scroll, reveal, year |
| `scripts/build.mjs` | Copies deployable files into `dist/` |

## Design (meadow video hero + warm surface, 2026)

**Goal:** Full-viewport meadow video hero that scrolls away into a warm off-white page (`#f5f5f2`) with raised panels (`#fbfbf8`)—bright, readable, light theme only.

| Decision | Rationale |
| --- | --- |
| **Hero video** | Looping WebM, `object-fit: cover`, feather into page surface |
| **Scroll** | Hero in normal document flow (not pinned); content below is solid surface |
| **Typography** | **Noto Serif SC** headings + **Noto Sans SC** body + **IBM Plex Mono** labels |
| **Motion** | Video loop + subtle card parallax + section reveal; paused/hidden under `prefers-reduced-motion` |
| **Content** | Same identity, placeholders, and social URLs—no fabricated projects |
