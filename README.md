# hiwushuang.me — personal homepage

Static personal site for **陈璐 · mocca** ([hiwushuang.me](https://hiwushuang.me)). Layout and visual system follow [Nutlope/Hallmark](https://github.com/Nutlope/hallmark) with the **Cobalt** theme (graphite-forward hero, ruled index, keycap actions).

## Cloudflare Pages

| Setting | Value |
| --- | --- |
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (repository root) |
| **Node version** | 20 or later (build copies static assets only; no runtime on Pages) |

Deploy steps: connect the GitHub repo, set the build command and output directory above, save and deploy. Custom domain **hiwushuang.me** should point at the Pages project (already live).

## Local development

```bash
npm run build          # writes dist/
python3 -m http.server 8787 --directory dist
# open http://127.0.0.1:8787/
```

During design work you can also open the repo root (`index.html` links `styles.css`, `tokens.css`, `base.css`).

Optional Hallmark lint (requires Hallmark skill installed under `.agents/skills/hallmark`):

```bash
npm run lint:hallmark
```

## Repository layout

| Path | Role |
| --- | --- |
| `index.html` | Page markup and minimal ASCII-field script |
| `styles.css` | Hallmark stamp, layout, Cobalt page rules |
| `tokens.css` | Cobalt + shared scale tokens (from Hallmark scaffold) |
| `base.css` | Hallmark floor base rules |
| `scripts/build.mjs` | Copies deployable files into `dist/` |
| `dist/` | Build output (generated; not committed) |

## Before / after (redesign)

**Before:** Single-file [Simplefolio](https://github.com/sethcottle/simplefolio)-style page — warm paper, rounded cards, emoji nav icons, light/dark toggle.

**After:** Hallmark **Cobalt** (graphite-forward): sticky edge nav, index hero with live ASCII glyph field, ruled project table, contact rows, keycap CTAs, intentional motion with `prefers-reduced-motion` fallback. Content unchanged except removing the outdated DNS placeholder line; domain shown as live **hiwushuang.me**.
