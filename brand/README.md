# QFoundry brand assets

Direction **A, Crucible**, chosen 2026-11-17 from the three directions on the design canvas (https://claude.ai/artifact/JN57rqTPWsoNwLSa225TCf). Built from the brief in [qbank-homepage/docs/prompts/brand-identity-and-assets.md](../qbank-homepage/docs/prompts/brand-identity-and-assets.md); this is the asset half of Phase 5 of [docs/roadmaps/qfoundry-brand-and-hostnames.md](../docs/roadmaps/qfoundry-brand-and-hostnames.md).

**Nothing here is wired into an app yet.** The files sit here until each app takes its own set (the table under "Where each file goes").

## The idea

The Q is a crucible, the vessel a foundry pours from, and its tail is the molten drop on its way into the mould: questions cast into papers. One ring and one dot, so it holds at 16 pixels. It keeps the indigo the apps already use (`#432dd7`) and adds one warm accent, Molten.

## Folders

| Folder | What is in it |
|---|---|
| `master/` | The source vectors, text outlined (no font needed): mark (colour, white, black, mono, mono white), wordmark, horizontal and stacked lockups, and the Studio, Prep and Writer lockups, each with a `-white` reversed version |
| `homepage/`, `studio/`, `prep/`, `writer/` | One browser and install set per app: `favicon.svg`, `favicon.ico` (16, 32, 48), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180, opaque), `android-chrome-192x192.png` and `-512x512.png` (`any`), `maskable-icon-512x512.png`, `monochrome-icon-512x512.png`, `site.webmanifest` |
| `in-app/` | `logo-only-blue-*.webp` and `logo-only-white-*.webp` at 80, 160 and 240; `logo-only-blue.png` and `logo-only-white.png` at 1024 for the writer. The "blue" name is kept so the files drop in; the colour is now indigo |
| `social/` | Open Graph images (1200x630) for the homepage and each app, Telegram bot avatar (640), Telegram description and Mini App picture (640x360), X profile (400) and header (1500x500), Instagram profile (1080), a square announcement template (1080) |
| `print/` | `qfoundry-pdf-footer.svg` (black only) and `watermark-specimen-a4.png`, a greyscale A4 page with the watermark over English and Malayalam questions |
| `palette/` | `brand-palette.css` (light, `.dark`, and `[data-public-theme="black"]`) and `contrast.md` (every pair, computed) |
| `source/` | `build.mjs`, the script that makes everything above |

## How the apps tell apart

One mark on three grounds:

| App | Icon ground | Mark | Favicon |
|---|---|---|---|
| Homepage | Indigo `#432dd7` | White ring, light Molten drop | Indigo tile |
| Studio | Indigo `#432dd7` | White ring, light Molten drop | Indigo tile |
| Prep | White, with a hairline border | Indigo ring, Molten drop | White tile with a lilac edge (the quietest: Prep carries the institute's brand, not ours) |
| Writer | Ink `#1B1446` | White ring, Molten drop | Ink tile |

Every favicon is a tile, so it reads on a white tab and a dark one alike. A bare mark that switched to white with `prefers-color-scheme` was tried and dropped (2026-11-17): the media query follows the operating system, not the tab, so a dark OS with a white tab drew a white ring on white.

## Usage

**Colours.** On white or a light ground: an indigo ring and a Molten `#F2551B` drop, with the wordmark in Ink `#1B1446`. On indigo, ink, navy or a photo: a white ring and a light Molten `#FF8A50` drop, with the wordmark in white. The indigo mark is never placed on a dark ground (2.1:1 on navy). Print: everything black.

**Clear space.** Keep empty space round the mark or a lockup equal to a quarter of the mark's height (about the drop's diameter) on every side.

**Minimum sizes.**

| Item | Screen | Print |
|---|---|---|
| Mark alone | 16 px | 4 mm |
| Horizontal lockup | 96 px wide | 20 mm wide |
| Stacked lockup | 64 px wide | 14 mm wide |
| PDF footer line | n/a | 4 mm tall |

**Lockups.** The mark is 1.4 times the wordmark's font size, set 0.32 em before the wordmark and centred on its cap height. A qualifier (Studio, Prep, Writer) follows after a word space, in Plus Jakarta Sans Medium: Indigo 600 `#5f57ee` on light, Lilac `#CBC8FF` on dark. It is never a second product name, and never stands without "QFoundry" before it.

**Typeface.** The wordmark is Plus Jakarta Sans ExtraBold at -0.025 em tracking, outlined. It is not to be retyped in another font. The apps themselves run in Inter (the homepage dropped Plus Jakarta Sans on 2026-11-17); where an app sets the name as live text beside the mark, as the homepage header does, it uses Inter ExtraBold, and the outlined wordmark stays for the logo files, images and print.

**Do not:** stretch, rotate or outline the mark; recolour it outside this palette; add shadows, gradients or glows; separate the drop from the ring or move it; put the colour mark on a busy photo (use the white version on a darkened area); set the word as "Qfoundry", "QFOUNDRY" (except the PDF watermark) or "Q Foundry".

## Where each file goes

Applying these is Phase 5 of the brand roadmap, one app at a time, and is not done yet.

| From | To | Notes |
|---|---|---|
| `homepage/*` | `qbank-homepage/public/` | `index.html` gains `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` |
| `social/og-image.png` | `qbank-homepage/public/og-image.png` | |
| `in-app/logo-only-{blue,white}-80.webp` | `qbank-homepage/public/images/`, `qbank-admin/public/images/` | |
| `studio/*` | `qbank-admin/public/` | |
| `social/og-image-studio.png` | `qbank-admin/public/og-image.png` | |
| `prep/*` | `qbank-learner/public/` | Replaces the Vite-logo `favicon.svg`; `index.html` gains the manifest and icon links. A design change in the learner app goes through the canvas first (its CLAUDE.md, hard rule 16) |
| `social/og-image-prep.png` | `qbank-learner/public/` | The learner app has no Open Graph tags yet; a paper's share link may want its own image instead |
| `writer/*` | `qbank-writer/public/` | |
| `in-app/logo-only-{blue,white}.png` | `qbank-writer/public/images/` | Used by `AppLogo.jsx` |
| `social/telegram-bot-avatar-640.png` | BotFather, Edit Bot, Edit Botpic | One bot per environment |
| `social/telegram-description-640x360.png` | BotFather, Edit Description Picture, and the Mini App photo | |
| `print/qfoundry-pdf-footer.svg` | The API's PDF attribution, if it draws a mark | The watermark text `QFOUNDRY` / `qfoundry.in` is already what the apps ship |
| `palette/brand-palette.css` | Each app's `index.css`, under its own rules | The `--brand-*` ramp is unchanged; the rest is new |

## Not in this set

- **Login backgrounds** (`book-bg-login.webp` in the admin and writer) are unchanged; the brief asked for a new one only if the identity called for it, and a flat indigo panel with the white mark would do.
- **`docs/sample_paper.pdf`** needs re-exporting from the app with the new attribution.
- **The X and Instagram images** wait for the handles to be registered.

## Rebuilding

`source/build.mjs` makes every file from code. It needs `opentype.js@1.3.4` and `@fontsource/plus-jakarta-sans@5.1.1` installed beside it (`pnpm add` in a scratch folder), Playwright's Chromium (the copy in `qbank-admin/node_modules` works), and the Mandaram font:

```bash
node build.mjs <out-dir> <path-to>/qbank-admin/node_modules/playwright <path-to>/qbank-homepage/src/assets/fonts/MANDARAM.ttf
```

The mark is drawn on a 64-unit grid: a ring of radius 20 and stroke 10 centred at (30, 30), open from 15° to 75°, with round caps, and a drop of radius 6.5 at (51.5, 51.5).
