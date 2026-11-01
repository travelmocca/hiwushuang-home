# hiwushuang.me — personal homepage

Static personal site for **陈璐 · mocca** ([hiwushuang.me](https://hiwushuang.me)). Pure HTML/CSS with a minimal year script—no framework, no Hallmark template.

## Cloudflare Pages

| Setting | Value |
| --- | --- |
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (repository root) |
| **Node version** | 20 or later |

Connect the GitHub repo, set the build command and output directory above, then deploy. Custom domain **hiwushuang.me** should point at the Pages project.

## Local preview

```bash
npm run build
python3 -m http.server 8787 --directory dist
# open http://127.0.0.1:8787/
```

During markup/CSS edits you can also open `index.html` from the repo root (styles load from sibling CSS files).

## Repository layout

| Path | Role |
| --- | --- |
| `index.html` | Page structure, accessibility hooks, year script |
| `tokens.css` | Color, type, spacing design tokens |
| `base.css` | Reset and shared primitives |
| `styles.css` | Layout and components |
| `assets/icons/social/` | Social icons (SVG/PNG) |
| `scripts/build.mjs` | Copies deployable files into `dist/` |
| `dist/` | Build output (generated; not committed) |

## Design (2026 refresh)

**Goal:** A calm, dark indie portfolio—closer to Linear / Vercel restraint than a scaffolded theme.

| Decision | Rationale |
| --- | --- |
| **Dark neutral base** (`oklch` cool grays) | Tech-forward without purple-gradient clichés |
| **DM Sans + Noto Sans SC + IBM Plex Mono** | Latin display, comfortable 中文正文, mono labels |
| **Single surface** | No light “paper” bands, fold rules, or beveled panels |
| **Work list instead of table** | Same honest placeholders; cleaner on mobile |
| **CSS ambient hero** | Subtle grid + gradient mesh; removed ASCII canvas noise |
| **Motion** | Short entrance + slow ambient drift; disabled under `prefers-reduced-motion` |
| **A11y** | Skip link, landmarks, `aria-label`s, focus rings, semantic lists |

Content, social URLs, and mailto are unchanged. No fabricated projects.
