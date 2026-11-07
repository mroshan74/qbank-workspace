# Roadmap: QFoundry, the brand and the hostnames

**Status (2026-11-07):** Phases 0 to 3 done: every screen says QFoundry with Studio / Writer / Prep beside it; the marketing pages live in the new `qbank-homepage` repo and the admin serves nothing public but `/login`; the deploy repo, the workspace meta files, the six hook copies and every doc carry the `homepage` tier and the `qfoundry.in` hosts, verified on the six-service prod-parity stack. **Phase 4 (the server cutover) needs DNS, GitHub secrets and SSH and is the next step; Phase 5 is design and account work.** Nothing is pushed from any repo until Phase 4, by design (decision 2); the GitHub repo `mroshan74/qbank-homepage` does not exist yet and the local repo has no `origin` (creating it needs the owner's GitHub access, Phase 4).

| Phase | Scope | State |
|---|---|---|
| 0 | This roadmap and the cross-links in the root docs and the two sibling roadmaps | done |
| 1 | Brand constants and hardcoded leftovers in the four app repos and the API | done |
| 2 | Scaffold `qbank-homepage`, move the marketing and legal pages out of `qbank-admin` | done |
| 3 | Deploy repo: `homepage` service, new keys, scripts, local stack :8083, workspace meta, hook copies, hostname doc sweep | done |
| 4 | Server cutover: DNS, `/opt/qbank/.env`, certificates, the order of pushes, verification, cleanup | not started |
| 5 | Assets and external accounts (non-code, tracked here) | not started |

**Owner repos:** this workspace root (the roadmap spans every repo), plus `qbank-api`, `qbank-admin`, `qbank-learner`, `qbank-writer`, `qbank-deploy`, and a new sixth repo, `qbank-homepage`. It is the successor of [rename-to-qbank.md](rename-to-qbank.md) Phase 4 and absorbs the server side of [qbank-writer/docs/roadmaps/writer-portal.md](../../qbank-writer/docs/roadmaps/writer-portal.md) Phase 8.

> **One phase at a time.** Implement the single phase (or task) that was asked for, tick its boxes here, update the touched repos' docs in the same change, report, and stop. Do not continue into the next phase unless told to. A box is ticked only when the work is done and documented.

## Context

The product becomes **QFoundry** (Q for Question) on **qfoundry.in**:

| Host | App | Repo | Compose service / Traefik router | Env keys |
|---|---|---|---|---|
| `qfoundry.in` (+ `www.` redirecting to it) | marketing site, **new standalone React app** | `qbank-homepage` (new) | `homepage` / `homepage` | `HOMEPAGE_HOST`, `HOMEPAGE_TAG`, `HOMEPAGE_IMAGE` |
| `studio.qfoundry.in` | staff back office | `qbank-admin` | `web` / `archiver` (router name unchanged) | `ADMIN_HOST`, `WEB_*` |
| `prep.qfoundry.in` | learner | `qbank-learner` | `learner` / `learner` | `LEARNER_HOST`, `LEARNER_*` |
| `writer.qfoundry.in` | writer portal (its own subdomain, not shared with studio) | `qbank-writer` | `writer` / `writer` | `WRITER_HOST`, `WRITER_*` |

What the investigation (2026-11-07) found:

- **The brand is already one constant per app** (rename-to-qbank Phase 1): `qbank-admin/src/lib/site.js`, `qbank-learner/src/lib/site.js`, `qbank-writer/src/lib/site.js`, `qbank-api/src/common/app-name.ts`, plus a `siteHtml` Vite plugin filling `%APP_NAME%` in each `index.html`. The rename itself is four lines. What remains are leftovers: `support@archiver.in` (4 admin files), `privacy@trynbuild.com` (Privacy.jsx), `support@trynbuild.com` (learner `site.js`), "trust Archiver" in `qbank-admin/src/pages/login/Login.jsx:23`, five duplicated tagline literals in admin `index.html`, the API's Swagger description (`src/main.ts:75`) and PDF attribution tagline "the Kerala PSC question archive" (`src/organizations/helpers/licence-notice.ts:48`), a third-party default watermark `MAKEITEASY PSC` in three places, empty `site.webmanifest` names (admin, writer), the admin's `FAVICON = "/favicon.svg"` pointing at a file that does not exist, the learner's favicon being the stock Vite logo, and the writer's `APP_NAME = "QBank Writer"` (violates rename decision 10: the codename never appears on a screen).
- **Hostnames are not hardcoded anywhere in code or compose.** Everything reads `ADMIN_HOST` / `LEARNER_HOST` / `WRITER_HOST` / `CLIENT_URL` from the server's `/opt/qbank/.env`; the SPAs call a relative `/api`. The cutover is DNS plus an `.env` edit plus a doc sweep (26 files name `trynbuild`, 23 of them markdown). No cookies, no canonical/og:url literals, no robots/sitemap anywhere.
- **The marketing site already exists, inside the admin app:** `/`, `/about`, `/contact`, `/cancellation`, `/pricing`, `/rules/organizations`, `/rules/individuals`, `/terms`, `/privacy` (`qbank-admin/src/App.jsx:128-138`, `src/utils/routeLinks.js:3-16`), 55 files under `src/pages/landing/`, served by `src/layouts/PublicLayout.jsx`. It makes no API calls. Its only outside dependencies: `@/lib/utils` (`cn`), `@/lib/site`, `@/utils/routeLinks`, `PageMeta`, shadcn `button`/`separator`/`collapsible`, `StatusSegmentedControl`, `useAuthStore` (the "Go to app" button in `PublicHeader.jsx` and `LandingCTAButtons.jsx`, which cannot work cross-origin), `usePreferencesStore` (`publicTheme`, also read by the pre-paint script in `index.html` via the `psc-admin-preferences` key), `useScrollToTop`, `useApplyPublicTheme`. Extracting it is a copy-and-replace of those eleven targets, not a rewrite.
- **Deploy already deploys one service at a time** (`deploy.sh <svc> <tag>`, `--no-deps`), so a separate repo is what makes a site change not rebuild the admin image; the goal is met by the sixth repo, not by a new deploy mechanism. The pattern to copy is the writer's deploy commit `b203eb8` (8 files in `qbank-deploy`) plus the writer's Dockerfile / nginx.conf / workflow. Naming follows the existing repo-to-service convention (`qbank-writer` is the `writer` service): repo `qbank-homepage`, service, router and container `homepage`, image `ghcr.io/mroshan74/qbank-homepage`, keys `HOMEPAGE_HOST` / `HOMEPAGE_TAG` / `HOMEPAGE_IMAGE`.
- **Two roadmaps are mid-flight and this one must not lose them:** [rename-to-qbank.md](rename-to-qbank.md) Phase 3 (server cutover `/opt/psc-archiver` to `/opt/qbank`) is committed in four repos but **not pushed and not done on the server**; its Phase 4 "apply the brand" is this roadmap. [writer-portal.md](../../qbank-writer/docs/roadmaps/writer-portal.md) Phase 8 is repo-side done with the host still to be confirmed, server side pending.

## Decisions taken up front

1. **This roadmap is rename-to-qbank's Phase 4 plus the hostname roadmap its Phase 4 asked for.** Rename Phase 3's server steps run as **step 0 of Phase 4 here** (one maintenance window, one reseed); its boxes stay in rename-to-qbank.md and are ticked there. The writer's Phase 8 server steps are absorbed into Phase 4 here with host `writer.qfoundry.in`.
2. **Nothing is pushed until Phase 4.** Every workflow's SSH step calls `/opt/qbank/scripts/deploy.sh`, which does not exist on the server yet. Phases 1 to 3 are committed locally; Phase 4 pushes in a fixed order.
3. **One product name, a qualifier beside it.** `APP_NAME = "QFoundry"` in all four constants. A separate `APP_ROLE` constant carries the door: `"Studio"` (admin), `"Writer"` (writer), `"Prep"` (learner), none in the homepage. It appears only in the tab title (`QFoundry Studio`), the logo sub-line and the webmanifest `name`, never as a second product name. Confirmed 2026-11-07.
4. **Emails and the operator's name.** Two mailboxes, confirmed 2026-11-07: `support@qfoundry.in` and `privacy@qfoundry.in`. **Awiztec goes.** "Awiztec Technologies" is not a registered company, so the Terms sentence "owned by Awiztec Technologies" (`Terms.jsx:213`) asserts ownership by an entity that does not legally exist; it becomes "owned by {APP_NAME}" until a legal entity is registered, at which point one sentence in Terms names it (a Phase 5 open item, not a blocker). The business-inquiries address on Contact (`Contact.jsx:34-35`) and the licensing address on Organization Rules (`OrganizationRules.jsx:237-238`), both `contact@awiztec.com`, read `SUPPORT_EMAIL`: one brand, one domain, two mailboxes.
5. **Social handles are unknown.** The homepage's `TWITTER_HANDLE`, `TELEGRAM_*`, `INSTAGRAM_URL` become empty strings and every social link renders only when its constant is non-empty. Filling them is one line each (Phase 5).
6. **The trynbuild hosts are dropped, not redirected** (confirmed 2026-11-07: `trynbuild.com` was only ever the QA deployment domain, so nobody holds a link to it). Their DNS records are removed in Phase 4 cleanup and no redirect router is added.
7. **The admin after extraction:** `/` renders `<Navigate to={DASHBOARD_LINK} replace />` (AuthGate turns it into `/login` for a visitor); `src/pages/landing/`, `PublicLayout`, the public-theme store slice, hooks and pre-paint script are deleted, not kept dormant; the login `BrandLogo` links to `https://qfoundry.in` and the login page gains Terms and Privacy links to the homepage. Verified: outside `pages/landing`, only `App.jsx`, `components/sidebar/NavItem.jsx` (a `HOME_LINK` fallback) and `pages/login/components/BrandLogo.jsx` use the public links.
8. **The learner keeps its own `/terms` and `/privacy`** (learner wording); only its constants change. `/welcome` stays its public entry.
9. **The homepage is static:** no API calls, no `/api` or `/fonts/` nginx blocks, no `CLIENT_URL` entry. Its deploy probe is `/healthz`, so `deploy.sh` gains a per-service probe *path*, not only a probe *container*.
10. **"Go to app" becomes plain links:** "Sign in to Studio" (`STUDIO_URL`), "Open Prep" (`PREP_URL`) where the copy calls for it, the writer portal in the footer (`WRITER_URL`).
11. **Default watermark** (confirmed 2026-11-07): `MAKEITEASY PSC` / `t/makeiteasy_psc` is a third-party brand shipped off-by-default in api `paper-defaults.dto.ts:153-154`, admin `question-paper-editor/data/defaultPaper.js:55-56`, learner `src/pdf/data/defaultPaper.js:55-56`. Becomes `QFOUNDRY` / `qfoundry.in`, kept identical in all three.
12. **`.env.example` keeps placeholders** (`example.com`, `studio.example.com`, `prep.example.com`, `writer.example.com`); README, QUICKSTART and INTEGRATION name the real hosts.
13. **Not renamed:** compose service names, the `archiver` router, package/image/container names, the `pscdatabuilder` seed files, the learner `UserAvatar` seed string, localStorage keys, code comments.

## Phase 0: the roadmap itself (docs only)

- [x] This file at `docs/roadmaps/qfoundry-brand-and-hostnames.md`; linked from root `CLAUDE.md` ("Planning and roadmaps") and `AGENTS.md` beside rename-to-qbank.md.
- [x] `docs/roadmaps/rename-to-qbank.md`: Phase 4 row and section point here; Phase 3's server side notes that it runs as this roadmap's Phase 4 step 0.
- [x] `qbank-writer/docs/roadmaps/writer-portal.md`: Phase 8 heading, open box and exit say `writer.qfoundry.in` and point to Phase 4 here.
- [x] Confirmed with the owner (2026-11-07): `APP_ROLE` values Studio / Writer / Prep (decision 3); mailboxes `support@` and `privacy@qfoundry.in` (4); Awiztec removed from every page, both of its addresses become `SUPPORT_EMAIL`, the Terms ownership sentence names QFoundry until a legal entity exists (4); the watermark default becomes `QFOUNDRY` / `qfoundry.in` (11); the trynbuild hosts are dropped with no redirect, they were the QA domain (6).

**Exit:** the three roadmaps cross-reference each other and no step is listed twice. *(Met 2026-11-07.)*

## Phase 1: brand constants and leftovers (api, admin, learner, writer)

Goal: every screen says QFoundry; no old brand, old email or third-party brand literal remains in `src/`, `index.html` or `public/`. Hostnames untouched here.

**qbank-admin**
- [x] `src/lib/site.js`: `APP_NAME = "QFoundry"`, `APP_ROLE = "Studio"`, `HOMEPAGE_URL`, `HOMEPAGE_TERMS_URL`, `HOMEPAGE_PRIVACY_URL`, `SUPPORT_EMAIL`, `PRIVACY_EMAIL`; `FAVICON = "/favicon.ico"` and `APPLE_TOUCH_ICON = "/apple-touch-icon.png"` (both now name files that exist).
- [x] `vite.config.js` `siteHtml` fills `%APP_ROLE%`, `%APP_TAGLINE%`, `%APP_DESCRIPTION%` too; `index.html` reads the placeholders instead of five repeated literals; title `QFoundry Studio`.
- [x] `Login.jsx` reads `APP_NAME`; the "Admin Control" sub-line in `BrandLogo.jsx`, `sidebar/LogoItem.jsx` and the landing `MockSidebar.jsx` renders `APP_ROLE`.
- [x] Emails: `Contact.jsx` (support and business inquiries), `PublicFooter.jsx`, `Cancellation.jsx`, `IndividualRules.jsx`, `OrganizationRules.jsx` read `SUPPORT_EMAIL`; `Privacy.jsx` reads `PRIVACY_EMAIL`; `Terms.jsx` says "owned by {APP_NAME}" (decision 4).
- [x] `defaultPaper.js` watermark `QFOUNDRY` / `qfoundry.in`; `site.webmanifest` "QFoundry Studio" / "QFoundry"; `50x.html` by hand; `Dockerfile` label. Four stale "PSC Archiver" code comments fixed while there.
- [x] Docs: `docs/arch/12-user-facing-copy.md` (the `APP_ROLE` rule, the mailboxes, the placeholders). `ARCHITECTURE.md` does not mention the constant, so nothing to change there.

**qbank-learner**
- [x] `src/lib/site.js`: `APP_NAME`, `APP_ROLE = "Prep"`, `SUPPORT_EMAIL = "support@qfoundry.in"`; `index.html` title and description via the plugin; `useDocumentTitle` renders `Home · QFoundry Prep`.
- [x] `src/pdf/data/defaultPaper.js` watermark; `Dockerfile` label; the Vite-logo favicon noted in `docs/todos/client-deployment-gaps.md` as a Phase 5 asset.
- [x] Docs: `docs/arch/12-user-facing-copy.md` (rule and the example row), `docs/arch/11-shared-atoms-manifest.md`, `docs/features/legal-pages.md`.

**qbank-writer**
- [x] `src/lib/site.js`: `APP_NAME = "QFoundry"`, `APP_ROLE = "Writer"`; the plugin fills `%APP_ROLE%`; the login wordmark shows `QFoundry Writer`, the welcome line `QFoundry`; `site.webmanifest` names. `AppLogo.jsx` carries no text, so it needed nothing.
- [x] Docs: `docs/arch/12-user-facing-copy.md` gained the brand section; `ARCHITECTURE.md` Brand section; roadmap decision 10 records the fix.

**qbank-api**
- [x] `src/common/app-name.ts`: `APP_NAME = 'QFoundry'`, `APP_URL = 'https://qfoundry.in'`.
- [x] `src/main.ts` Swagger description built from `APP_NAME`; `licence-notice.ts` prints `Prepared with QFoundry (https://qfoundry.in).` (rendered per export, never stored).
- [x] `paper-defaults.dto.ts` watermark; `Dockerfile` label.
- [x] Docs: `ARCHITECTURE.md` constants note. `doc/02-modules.md` does not quote the line.

**Gates (met 2026-11-07):** `pnpm lint` (0 errors), `pnpm check:copy` and `pnpm build` green in admin, learner, writer; `pnpm build` and `pnpm lint:ci` green in api; the built titles read `QFoundry Studio`, `QFoundry Prep`, `QFoundry Writer` with no `%` placeholder left.

**Exit (met 2026-11-07):** from the root, `grep -rniE "PSC Archiver|QBank Writer|archiver\.in|trynbuild|awiztec|makeiteasy|pscarchiver" qbank-*/src qbank-*/index.html qbank-*/public` returns only the admin's social constants (deleted in Phase 2) and the admin's `public/docs/sample_paper.pdf` (a Phase 5 asset).

## Phase 2: scaffold `qbank-homepage`, move the public pages out of `qbank-admin`

Two commits in two repos; the admin's is **pushed only after the homepage is live** (Phase 4 order), so the marketing pages are never offline.

### 2a. `qbank-homepage` (new repo, `main`, private, `github.com/mroshan74/qbank-homepage`)

- [x] Scaffolded as a sibling of the admin (Vite 8, React 19, Tailwind 4, the same `.nvmrc`, `packageManager`, `engines`, `.prettierrc`, eslint config and `components.json`); deps trimmed to what the pages import (`react-router`, `react-helmet-async`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `zustand`, `@mantine/hooks`, `radix-ui`, `shadcn`, the two font packages). The three shadcn atoms are the admin's generations copied as is (byte-identical to what the CLI would produce for the same `components.json`). `@/` alias kept.
- [x] Scripts `dev` (:5190, `strictPort`), `build`, `lint`, `preview`, `check:copy` (empty allowlist), `check:env`.
- [x] Copied from the admin and adapted: `src/pages/landing/**` (55 files), `PublicLayout`, `useScrollToTop`, `useApplyPublicTheme`, `PageMeta`, `PageLoader`, `StatusSegmentedControl`, `cn`, the token blocks `.landing-theme` and the atoms read (`src/index.css`, cut down), `index.html` (pre-paint script, boot spinner), the icon set, `og-image.png`, the two `logo-only-*.webp`, `docs/sample_paper.pdf`, `50x.html`.
- [x] Replaced, not copied: `useAuthStore` (header and CTA buttons are plain links to `STUDIO_URL`, decision 10); `usePreferencesStore` became `src/store/usePublicTheme.js` (persist key `qfoundry-homepage`, read by the pre-paint script); `@/utils/routeLinks` became `src/lib/routes.js`; `src/lib/site.js` carries the brand, the three doors (`STUDIO_URL` / `PREP_URL` / `WRITER_URL` with labels), the two mailboxes, empty social constants (the footer, Contact, the landing JSON-LD and `PageMeta`'s `twitter:site` all check for an empty string), `getAppUrl` / `toAbsoluteUrl`; `.env.production` pins `VITE_APP_URL=https://qfoundry.in`.
- [x] `src/App.jsx` with the nine lazy pages and `*` to `/`; `public/robots.txt` and `public/sitemap.xml`; `site.webmanifest` named.
- [x] Container: `Dockerfile` (no `patches/`, no `pnpm-workspace.yaml`), `nginx.conf` with gzip, `/healthz`, SPA fallback, immutable hashed assets, `50x.html`, and **no** `/api/`, `/fonts/` or `resolver`.
- [x] `.github/workflows/deploy.yml`: the writer's with the names changed (`qbank-homepage`, `deploy-homepage-*`, `deploy.sh homepage "$IMAGE_TAG"`).
- [x] Repo docs: `CLAUDE.md`, `AGENTS.md`, `ARCHITECTURE.md`, `docs/arch/12-user-facing-copy.md`, `docs/features/marketing-pages.md` (rewritten for the new home), `docs/features/README.md`, `docs/roadmaps/README.md`; `.claude/settings.json` and the sixth hook copy (untracked, like every repo's). Committed as `80d1023`, 111 files, not pushed.

### 2b. `qbank-admin` trim

- [x] Deleted `src/pages/landing/`, `PublicLayout.jsx`, `useScrollToTop.js`, `useApplyPublicTheme.js`, `public/docs/sample_paper.pdf`. `PageMeta.jsx` stays (Organizations and the paper editor use it), and so do `og-image.png`, `getAppUrl` / `toAbsoluteUrl` and `APP_TAGLINE`, which it reads; it no longer emits `twitter:site`.
- [x] `usePreferencesStore.js`: `publicTheme` and its helpers gone; persist version 6 drops the stale field.
- [x] `index.html`: pre-paint script, dark/black boot variants and the share-preview block gone.
- [x] `src/index.css`: `--brand-accent` / `--brand-wash` kept; the two comments that pointed at the landing theme and `PublicLayout` updated.
- [x] `routeLinks.js`: the eight public constants gone, `HOME_LINK` kept. `site.js`: social constants and `PRIVACY_EMAIL` gone; `HOMEPAGE_URL`, `HOMEPAGE_TERMS_URL`, `HOMEPAGE_PRIVACY_URL`, `SUPPORT_EMAIL` kept and used.
- [x] `App.jsx`: `/` is `<Navigate to={DASHBOARD_LINK} replace />`, the nine lazy imports and the public block gone. `BrandLogo.jsx` is an anchor to `HOMEPAGE_URL`; `LoginForm.jsx` gained a footer line with Terms, Privacy and the support mailbox. `vite.config.js` fills only `%APP_NAME%`, `%APP_ROLE%`, `%APP_DESCRIPTION%`.
- [x] Docs: `docs/features/marketing-pages.md` is a pointer; `docs/features/README.md` row; `03-routing-auth.md`, `08-layout-navigation.md`, `02-state-management.md`, `11-shared-atoms-manifest.md` updated; the three landing roadmaps carry a moved note. `ARCHITECTURE.md` never named the landing folder, so nothing to change there.

**Gates (met 2026-11-07):** homepage: `pnpm lint` (0 errors), `check:env`, `check:copy`, `build` green, title `QFoundry`, no placeholder left; the nine routes and `/healthz` answer on the prod-parity stack (Phase 3). Admin: `pnpm lint` (0 errors), `check:copy`, `check:env`, `build` green, no `landing` chunk, title `QFoundry Studio`.

**Exit (met 2026-11-07):** `grep -rn "useAuthStore\|routeLinks\|usePreferencesStore" qbank-homepage/src` empty; `grep -rn "pages/landing\|PublicLayout\|publicTheme" qbank-admin/src qbank-admin/index.html` returns only the comments that say the pages moved.

## Phase 3: deploy repo, workspace meta, hostname doc sweep

**qbank-deploy** (pattern: writer commit `b203eb8`)
- [x] `compose.prod.yml`: `homepage` service (`${HOMEPAGE_IMAGE:-ghcr.io/mroshan74/qbank-homepage}:${HOMEPAGE_TAG:?}`, `container_name: qbank-homepage`, no `depends_on`, `/healthz` healthcheck, `traefik_proxy`) with labels:
  ```
  traefik.http.routers.homepage.rule=Host(`${HOMEPAGE_HOST:?HOMEPAGE_HOST is not set in .env}`) || Host(`www.${HOMEPAGE_HOST}`)
  traefik.http.routers.homepage.entrypoints=websecure
  traefik.http.routers.homepage.tls.certresolver=letsencrypt
  traefik.http.routers.homepage.middlewares=homepage-www-to-apex
  traefik.http.middlewares.homepage-www-to-apex.redirectregex.regex=^https://www\.(.*)
  traefik.http.middlewares.homepage-www-to-apex.redirectregex.replacement=https://$${1}
  traefik.http.middlewares.homepage-www-to-apex.redirectregex.permanent=true
  traefik.http.services.homepage.loadbalancer.server.port=80
  ```
  `$$` is compose's literal `$`. One router, one certificate with two SANs: the TLS challenge fails for both names if either does not resolve. HTTP to HTTPS is already the global entrypoint redirect. Header comment: four public hostnames.
- [x] `.env.example`: `HOMEPAGE_HOST=example.com` with the "a missing key stops every deploy" note, `HOMEPAGE_TAG`, `HOMEPAGE_IMAGE`; placeholder hosts `studio.` / `prep.` / `writer.example.com`; `CLIENT_URL` with the three app origins and a line saying why the homepage is absent.
- [x] `scripts/deploy.sh`: usage and whitelist gain `homepage`, `TAG_VAR` gains `HOMEPAGE_TAG`, the probe is `PROBE_SERVICE` + `PROBE_PATH` (`homepage` at `/healthz`, the rest unchanged at `/api/readyz`).
- [x] `scripts/rollback.sh` (whitelist, `IMAGE_VAR`), `scripts/deploy-latest.sh` (`HOMEPAGE_TAG`, a `probe_path` per tier, the loop covers four tiers), `scripts/setup-app.sh` (DNS text names the apex **and** `www`; five app repos).
- [x] `compose.local.yml`: `homepage` service on `${HOMEPAGE_PORT:-8083}`, header comments, the stray `\n#` in the header fixed.
- [x] `README.md` (hostname table with the real hosts, diagram, router names, repo layout, local URL table, secrets and deploy sections, health table, rollback, `dig` lines) and `QUICKSTART.md` (preconditions, verify lines, local `:8083`, "Adding the writer portal" generalised to "Adding a frontend tier", and a new one-time section "moving to the qfoundry.in hosts and adding the homepage" that is this roadmap's Phase 4 runbook, to be deleted after it runs). `INSTRUCTION.md` lists no services.

**Workspace root and hook copies**
- [x] `repos.json`, `qbank-workspace.code-workspace`, `.gitignore`, `.vscode/settings.json` gained `qbank-homepage`. `sync.sh` needed no change.
- [x] Root `CLAUDE.md` and `AGENTS.md` (six repos, the table row, the dev and stack run blocks, six hook copies); `INTEGRATION.md` header, topology diagram (a `homepage` branch with no `/api` arrow, the `qfoundry.in` hosts) and the deployment section ("Four frontends, four origins").
- [x] `.claude/hooks/doc-sync-reminder.mjs`: a `qbank-homepage/` branch; copied to api, admin, learner, writer and the homepage; `cmp` confirms six identical copies; the branch answers for a path under `qbank-homepage/src/` and the deploy repo stays silent.
- [x] Every sibling `CLAUDE.md` / `AGENTS.md` lists all six repos and says "six-repo product".

**Hostname and email doc sweep** (one `sed` pass over the files that matched; `rename-to-qbank.md` and this roadmap excluded)
- [x] 18 markdown files plus the admin `.env.example` comment: `archiver.` / `learner.` / `writer.trynbuild.com` to `studio.` / `prep.` / `writer.qfoundry.in`, the three old emails to the two new ones, the old QUICKSTART anchor to `adding-a-frontend-tier-to-a-running-server`, "proposed" dropped from the writer host.
- [x] Hand pass: the writer's `CLAUDE.md` host line; the admin's `CLAUDE.md` sibling list and host line.

**Gates (met 2026-11-07):** `bash -n` on the four scripts, all LF; `docker compose -f compose.local.yml config` lists six services; `compose.prod.yml` resolves with `HOMEPAGE_*` set (router rule `Host(example.com) || Host(www.example.com)`, the redirect middleware, service port 80) and refuses without `HOMEPAGE_TAG`; the prod-parity stack built and seeded with six healthy containers, `:8080` to `:8083` all answer, `:8083` serves the nine pages, `/healthz`, `robots.txt` and `sitemap.xml`, `/api/readyz` through `:8080` answers the API, and `:8083/api/` answers 404. The admin's `/` to `/login` redirect is client-side (React Router), so `curl` sees the SPA shell with a 200.

**Exit (met 2026-11-07):** `grep -rl trynbuild --exclude-dir=node_modules .` returns the two roadmaps and `qbank-deploy/QUICKSTART.md`, whose new cutover section names the old records so Phase 4 can remove them (the section is deleted after it runs); `grep -rn "archiver.example\|learner.example" qbank-deploy` empty.

## Phase 4: server cutover (one maintenance window)

Order matters: a missing `.env` key stops every deploy; the workflows call `/opt/qbank/...`; the admin push removes the marketing pages, so the homepage must be live first.

- [ ] **Step 0, if the server is still `/opt/psc-archiver`:** run rename-to-qbank Phase 3's server steps (down, `mv`, remote, `qbank-*` images, `qbank` database); do not seed yet; tick those boxes there.
- [ ] **DNS** for `qfoundry.in`: A `@`, `www`, `studio`, `prep`, `writer` to the VPS IP (low TTL); `dig +short` all five. Leave trynbuild records until verified.
- [ ] **GitHub:** create private `mroshan74/qbank-homepage` (`gh repo create mroshan74/qbank-homepage --private`, then `git -C qbank-homepage remote add origin https://github.com/mroshan74/qbank-homepage.git`); set the four `VPS_*` secrets on `qbank-homepage` and `qbank-writer`.
- [ ] **Server `.env`:** `ADMIN_HOST=studio.qfoundry.in`, `LEARNER_HOST=prep.qfoundry.in`, `WRITER_HOST=writer.qfoundry.in`, `WRITER_TAG/IMAGE` if absent, `HOMEPAGE_HOST=qfoundry.in`, `HOMEPAGE_TAG=latest`, `HOMEPAGE_IMAGE=ghcr.io/mroshan74/qbank-homepage`, `CLIENT_URL=https://studio.qfoundry.in,https://prep.qfoundry.in,https://writer.qfoundry.in`.
- [ ] **Push `qbank-deploy`**, then `git -C /opt/qbank pull --ff-only`.
- [ ] **Push app repos in order:** `qbank-api`, `qbank-homepage`, `qbank-learner`, `qbank-writer`, `qbank-admin` last. Watch `docker logs traefik` for ACME. If step 0 ran, `./scripts/deploy-latest.sh --seed` afterwards, then pin tags per the rename runbook.
- [ ] **Verify:** `curl -sI https://www.qfoundry.in/` is a 301 to the apex; `/healthz` on the homepage; `/pricing` renders with the apex `og:url`; `/api/readyz` through the three app nginx tiers; `studio/` lands on `/login`; a staff, a writer and a learner sign-in; a community-organization PDF shows the new attribution; one CI deploy per service green; `rollback.sh homepage <tag>` works.
- [ ] **GHCR:** `qbank-homepage` and `qbank-writer` packages private.
- [ ] **Cleanup:** remove the trynbuild DNS records (decision 6: no redirects); delete the runbook sections from `QUICKSTART.md`; rename Phase 3 cleanup (old volume, `pscarchiver` database, old GHCR packages after a week); tick the writer roadmap's Phase 8 box.

**Exit:** four hosts on Let's Encrypt with no warning; `www` redirects; every service deployed by its own CI run; old hosts gone from DNS; `/opt/qbank/.env` has no `trynbuild` and no `psc-archiver`.

## Phase 5: assets and external accounts (non-code, tracked here)

- [ ] Favicon set in `qbank-homepage/public/`, `qbank-admin/public/`, `qbank-writer/public/`; replace `qbank-learner/public/favicon.svg` (the Vite logo) and give the learner a `site.webmanifest`; review `THEME_COLOR` in each `site.js` and manifest.
- [ ] `qbank-homepage/public/og-image.png` (1200x630) with the new mark; `docs/sample_paper.pdf` re-exported with the new attribution and watermark.
- [ ] Logos: `logo-only-*.webp` (homepage, admin), `logo-only-*.png` (writer `AppLogo.jsx`), the learner's unused `logo-only-white-80.webp` (delete or use); login backgrounds if the look changes.
- [ ] Mailboxes `support@` and `privacy@qfoundry.in` exist and are read before the pages naming them go live.
- [ ] When a legal entity is registered, one sentence in the homepage's Terms names it as the owner (decision 4); until then the page says QFoundry.
- [ ] Social handles registered or decided, then filled in `qbank-homepage/src/lib/site.js`.
- [ ] SMS sender header: Message Central owns the code text; the header a learner sees is the vendor account's. Check the first `prep` sign-in; a branded header is a DLT registration outside code.
- [ ] Optional: Search Console for `qfoundry.in`, submit `sitemap.xml`.

**Exit:** no Vite logo, no empty manifest name, no `@pscarchiver` anywhere; both mailboxes answer a test mail.

## Verification summary

| Gate | Phases |
|---|---|
| `pnpm check:copy`, `lint`, `build` in every frontend touched; `build` + `lint:ci` in the api | 1, 2 |
| `pnpm check:env` in admin, learner, writer, homepage | 2 |
| `bash -n scripts/*.sh`, LF, compose `config` for both files (with and without `HOMEPAGE_*`) | 3 |
| Prod-parity stack with six services, seed, `:8083` nine pages, `:8080/` redirects | 3 |
| The two `grep` exit criteria (src/html/public; whole tree) | 1 to 3 |
| `curl` 301 on `www`, four TLS hosts, `/api/readyz` through three tiers, a CI deploy per service | 4 |

## Risks and non-goals

- **A missing `.env` key stops every deploy**: `HOMEPAGE_*` and `WRITER_*` go into `/opt/qbank/.env` before the deploy repo is pulled on the server.
- **`CLIENT_URL` replaces the fallback**: all three app origins, every time; the homepage is deliberately absent.
- **The apex certificate needs both names**: add `@` and `www` A records before the first `homepage` deploy.
- **Rename Phase 3 must not be lost**: its boxes are ticked when Phase 4 step 0 runs; nothing is pushed from any app repo before it.
- **Window between the deploy-repo pull and the DNS flip**: old hosts answer a Traefik 404; kept short by doing DNS first. MVP, accepted.
- **Admin push ordering**: the admin is pushed last so the marketing pages never disappear.
- **Traefik names are provider-global**: `homepage`, `homepage-www-to-apex` must stay unique; `archiver` stays as the admin's router.
- **Windows**: scripts keep LF; `pnpm install` in `qbank-homepage` before the local stack build; the hook is tested by hand (it fails silently).
- **Learner is whitelabelled by design**: the brand barely shows there; the OTP sender name is outside code.
- **Non-goals:** redesigning the marketing pages (they move as-is apart from brand strings); SEO beyond robots + a static sitemap; redirects from trynbuild; renaming compose services or the `archiver` router; registering a legal entity (the Terms name QFoundry until one exists); the learner's legal pages beyond constants; a shared component package between homepage and admin.
