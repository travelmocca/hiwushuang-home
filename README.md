# hiwushuang.me — personal homepage

Static personal site for **无双 · mocca** ([hiwushuang.me](https://hiwushuang.me)). A static HTML/CSS site with a locally served Three.js street scene. Reduced-motion and WebGL-free browsing use a still of the same model.

## Cloudflare Pages

The `hiwushuang-home` project uses Direct Upload. After building the merged `main` revision, publish with `npx wrangler pages deploy dist --project-name hiwushuang-home --branch main`.

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

You can also serve the repository root over HTTP while editing.

## Repository layout

| Path | Role |
| --- | --- |
| `index.html` | Page structure and accessibility hooks |
| `tokens.css` / `base.css` / `styles.css` | Design system and layout |
| `assets/scenery/tokyo-street.webp` | First-frame and reduced-motion poster |
| `assets/icons/social/` | Social icons |
| `scripts/hero-scene.js` | Navigation, scroll reveal, and progressive scene loading |
| `scripts/tokyo-hero.js` | Hero lighting, camera, controls, and playback |
| `scripts/tokyo/` | Editable procedural geometry, signs, and animation |
| `scripts/build.mjs` | Copies deployable files into `dist/` |

## Hero

The street scene sits beside the introduction on large screens and below it on small screens. Drag horizontally or focus the canvas and press the left or right arrow key to orbit. The model pauses when the hero scrolls out of view or the tab is hidden.

Artwork attribution is in [LICENSE-THIRD-PARTY.md](LICENSE-THIRD-PARTY.md).
