# Roadmap: rename the repos from `psc-archiver-*` to `qbank-*`

**Status:** Phase 1 done (2026-11-07, one commit per app repo). Phase 2 is next. Revised 2026-11-07 after the fifth repo, `qbank-writer`, was scaffolded on the new codename (its own plan: [qbank-writer/docs/roadmaps/writer-portal.md](../../qbank-writer/docs/roadmaps/writer-portal.md)).

| Phase | State |
|---|---|
| 1. Decouple the brand from the code | done: admin `7023430`, api `339c181`, client `6bde8ba` |
| 2. Rename the codename locally and on GitHub | not started |
| 3. Server cutover | not started |
| 4. Apply the brand (when it is chosen) | not started |

**Owner repos:** this workspace root (it owns `repos.json`, which defines the folder names), plus `psc-archiver-api`, `psc-archiver-admin`, `psc-archiver-client` and `psc-archiver-deploy`. `qbank-writer` is already named for the codename and keeps its brand in one constant from birth, so it is never renamed; it appears below only where its docs name the four siblings and where its deployment meets the server cutover. Phase 1 lives in the three older app repos; Phase 2 touches all six checkouts; Phase 3 is the deploy repo and the server.

> **One phase at a time.** Implement the single phase (or task) that was asked for, tick its boxes here, update the touched repos' docs in the same change, report, and stop. Do not continue into the next phase unless told to. A box is ticked only when the work is done and documented.

## Context

The brand and product name are not decided, yet "psc-archiver" is the folder name, package name, git remote, Docker image name, compose project name, server directory, and the user-visible brand ("PSC Archiver") in all three apps.

This is two different renames glued together, and they are separated here:

1. **The codename** (folders, repos, packages, images, compose, server path). Never seen by a learner. Mechanical: about 65 load-bearing occurrences in roughly 12 files, plus a bulk replace over about 1,400 mentions in some 170 markdown files (over 300 of them relative links such as `../psc-archiver-api/...`). Done once, with a name that will not change when the brand lands.
2. **The brand** ("PSC Archiver", `@pscarchiver`, `t.me/pscarchiver`, `trynbuild.com`). Seen by every user. Today it is about 60 hard-coded literals across three repos, so a brand change is a hunt. Phase 1 gives each app one constant that every literal reads from, so the eventual brand decision becomes a change of one line per app. `qbank-writer` is born that way: its roadmap puts the name in `src/lib/site.js` and nowhere else.

Measured on 2026-11-07 from the working tree, after `qbank-writer` was scaffolded:

| Layer | Where | Count |
|---|---|---|
| Brand literals (`PSC Archiver` / `PSC ARCHIVER`) in `src/` | admin 48, client 8, api 2 | 58 |
| Codename in code and config (non-markdown) | 95 files, about 270 occurrences; about 65 load-bearing, the rest comments and labels | 270 |
| Codename in markdown | 169 files, 1,388 occurrences, of which 10 files and about 60 mentions are `qbank-writer` docs naming the four siblings | bulk replace |
| `trynbuild.com` | 9 code hits (support and privacy emails, one comment), 44 doc hits | out of scope |

## Decisions taken up front

- **Codename `qbank`.** Repos become `qbank-api`, `qbank-admin`, `qbank-learner`, `qbank-deploy`; this workspace repo becomes `qbank-workspace`.
- **The learner app is `-learner`, not `-client`.** It matches the compose service `learner`, the env var `LEARNER_IMAGE` and the `learner.` hostname; "client" reads as "API client". The staff app's image becomes `qbank-admin` (today it is `psc-archiver-web`, the one inconsistency between repo, image and service names).
- **Stored state is not protected.** The product is an MVP with no real users and the production database is rebuilt from the seed on every major update. So the MongoDB database name (`pscarchiver` to `qbank`), the AI-jobs Docker volume name and the admin's localStorage keys are renamed, not kept. Phase 3 is a reseed, not a migration.
- **GitHub repos are renamed.** GitHub redirects the old URLs (clone, fetch, push, web, raw), so nothing breaks at the moment of renaming. Every stored URL is still updated in Phase 2, because the redirect dies if a repo is ever created under the old name.
- **`qbank-writer` is the template, not a target.** It already has the codename in its folder, GitHub URL, future image name (`ghcr.io/mroshan74/qbank-writer`) and compose service (`writer`), and its roadmap keeps the product name in `src/lib/site.js`. The rename never touches its code. Its docs name the four `psc-archiver-*` siblings and the workspace file, so they are in the Phase 2 sweep like everyone else's.
- **The two roadmaps interleave, and whichever lands second adapts.** The writer roadmap's Phases 6 and 8 add a `writer` service to the compose files, `WRITER_*` keys to `.env.example`, a `writer` case to `deploy.sh`, and a workflow whose SSH step names the server directory. If those run before Phase 3 here, they use `/opt/psc-archiver` and the `psc-archiver` project name, and Phase 3 renames them along with the rest; if Phase 3 runs first, they use `/opt/qbank` from the start. Neither roadmap waits for the other.
- **One product name on every screen.** Until the brand is chosen, all four apps show "PSC Archiver": the writer app's `APP_NAME` carries the same value as the admin's and the learner's (its roadmap, decision 10), and a per-app qualifier such as "Writer" is a separate constant, never a second product name. `qbank` is a codename for repos, images and the server and never appears on a screen. Phase 4 replaces all four constants at once.
- **Not renamed:** the hostnames `archiver.trynbuild.com`, `learner.trynbuild.com` and the planned `writer.trynbuild.com`, the support and privacy email addresses, the Telegram and Instagram handles (brand decisions that need DNS, certificates and real accounts); the compose service names `api`, `web`, `learner`, `writer` and the Traefik router names (renaming `web` changes `deploy.sh` arguments and all the workflows for no user-visible gain); the `pscdatabuilder` seed file names under `psc-archiver-api/data/` (an older name, separate concern).

## Load-bearing codename sites

These would break something if renamed carelessly. Everything not listed here is a comment, a label or display text.

| Site | Files | Handling |
|---|---|---|
| Git remotes | `origin` in all five repos, [repos.json](../../repos.json), `scripts/setup-app.sh` `REPO_URL` in the deploy repo, the `curl` line in the deploy README | Phase 2 |
| GHCR image names | `IMAGE_NAME` in the three `.github/workflows/deploy.yml` (hand-written, not derived from the repo name), image defaults in `compose.prod.yml` and `compose.local.yml`, `*_IMAGE` in `psc-archiver-deploy/.env.example`, the server's live `.env` | A new image name is a new GHCR package; old ones stay a week for rollback |
| Server directory `/opt/psc-archiver` | the `script:` line in the three workflows, `setup-app.sh` `APP_DIR`, deploy README and QUICKSTART | `mv` on the server, workflows updated in the same push (Phase 3) |
| Compose project `psc-archiver` | `compose.prod.yml` `name:` and three `container_name:`, `PROJECT_NAME` in `scripts/deploy.sh` and `scripts/deploy-latest.sh` | Must change together, or compose sees a second project and collides on container names (Phase 3) |
| Named volume `psc-archiver-ai-tagging-jobs` | `compose.prod.yml` | Renamed in Phase 3 with no AI-tagging job in flight; the old volume is removed afterwards |
| MongoDB database `pscarchiver` | `MONGODB_URI` in `psc-archiver-api/.env.example`, `psc-archiver-deploy/.env.example` and `compose.local.yml`; the hint in `scripts/bootstrap.mjs`; the server `.env` | Templates and the local stack in Phase 2; the server URI in Phase 3, then reseed and drop `pscarchiver` in Atlas by hand |
| localStorage keys `psc-archiver:bulk-import-*` | `psc-archiver-admin/src/pages/exam-papers/components/modals/bulk-import-questions-modal/helpers/mappingTemplates.js` | Phase 2; saved import templates on staff browsers are lost, acceptable at MVP |
| Local compose project `psc-archiver-local` | `compose.local.yml` `name:` (owns the `psc-archiver-local_mongo_data` volume) | Phase 2; the local Mongo is throwaway and the seed is idempotent |
| Local build contexts `../psc-archiver-*` | `compose.local.yml` | Must match the new folder names (Phase 2) |
| Root meta files | [.gitignore](../../.gitignore) (ignores the five folders; if stale, this repo starts tracking them), [psc-archiver-workspace.code-workspace](../../psc-archiver-workspace.code-workspace), [.vscode/settings.json](../../.vscode/settings.json) | Same change as the folder rename (Phase 2). Each already carries a `qbank-writer` entry; rename the other four lines and leave that one |
| Doc-sync hook regexes | [.claude/hooks/doc-sync-reminder.mjs](../../.claude/hooks/doc-sync-reminder.mjs) and its four byte-identical copies in the api, admin, client and `qbank-writer` repos | They match on the folder name and stop firing silently if not updated (Phase 2). The `qbank-writer` branch is already right; the other three patterns change in all five copies |
| Absolute paths and sibling names | the "Repo locations on disk" lists in the api, client and `qbank-writer` `CLAUDE.md`; the workspace-file link in `qbank-writer/CLAUDE.md` and `README.md`; `.claude/settings*.json` allowlists (untracked) | CLAUDE.md and README in Phase 2; stale allowlists are harmless |
| Writer deployment, if its Phases 6 and 8 land first | `qbank-writer/.github/workflows/deploy.yml` `script:` line; the `writer` service's `container_name` in `compose.prod.yml`; `WRITER_IMAGE` in `.env.example` (already `qbank-writer`, no change) | Phase 3 renames the directory in the workflow and the container name with the rest; nothing else of the writer's changes |
| Claude Code project state | `~/.claude/projects/c--00-FILES-PROJECTS-2026-psc-archiver*` (memory, plans, sessions) | Keyed by the root folder's absolute path. The root folder rename is optional and last, with that directory moved by hand |

## Phase 1: decouple the brand from the code (no rename)

Goal: one constant per app owns the product name, and no `src/` file spells it out.

- [x] **admin** (commit `7023430`): `src/lib/site.js` already exports `APP_NAME` and `TWITTER_HANDLE`; it gained `TELEGRAM_HANDLE`, `TELEGRAM_URL` and `INSTAGRAM_URL`. Every literal routed through it: `index.html` (title, `og:site_name`, the two descriptions, `twitter:site`, the loader's aria-label; inject with a small `transformIndexHtml` Vite plugin or `%VITE_APP_NAME%`), `src/pages/login/components/LoginForm.jsx` (a duplicate `APP_NAME`, delete it), `src/components/sidebar/LogoItem.jsx`, `src/pages/login/components/BrandLogo.jsx`, `src/pages/landing/components/PublicLogo.jsx`, `src/pages/landing/components/product-mockups/components/MockSidebar.jsx`, the landing and legal pages (`About`, `Cancellation`, `Contact`, `Pricing`, `Privacy`, `Terms`, `IndividualRules`, `OrganizationRules`, `components/PublicFooter`, `components/logo-strip/LogoStrip`, `components/proof/ProofSection`, `components/sections/PersonaSection`, `components/pricing/data/plans.js`), `src/pages/question-paper-editor/components/pdf/PaperDocument.jsx` and `PdfBatchCoverPage.jsx`, `src/pages/question-paper-editor/helpers/licenceLine.js`, `src/modals/batch-export/helpers/mergePdfPages.js` (PDF producer and creator metadata), `public/50x.html` (static, served by nginx when the app is down: either one literal stays with a comment, or template it at build).
- [x] **client** (commit `6bde8ba`): `src/lib/site.js` created (`APP_NAME`, `SUPPORT_EMAIL`); the constant moved out of `src/hooks/useDocumentTitle.js`; used in `index.html` (title and description), `src/pages/legal/content/termsOfUse.js` and `privacyNotice.js` (template strings, the support address included), `src/pdf/components/PaperDocument.jsx` (producer and creator). `licenceLine.js` and `pdf/index.js` turned out to carry no literal.
- [x] **api** (commit `339c181`): `src/common/app-name.ts` exports `APP_NAME`; used in `src/main.ts` (Swagger title) and `src/organizations/helpers/licence-notice.ts` (the attribution line). That line is rendered fresh on every PDF and never stored, so there is no data migration.
- [x] **qbank-writer**: nothing to do; it has no app code yet. Its Phase 1 creates `src/lib/site.js` with `APP_NAME = "PSC Archiver"`.
- [x] Gates: `pnpm check:copy` and `pnpm build` green in admin and client; `pnpm build` and `pnpm lint:ci` green in api. Built `index.html` in both apps carries the real name and no placeholder.
- [x] Docs, same change: admin and client `docs/arch/12-user-facing-copy.md` gained the rule "the product name comes from `src/lib/site.js`, never a literal"; client `docs/arch/11-shared-atoms-manifest.md` lists the atom; api `ARCHITECTURE.md` notes the constant.

**Exit criteria (met 2026-11-07):** `grep -r "PSC Archiver" */src` returns only the constant definitions plus code comments; the admin's `public/50x.html` keeps its one literal with a comment saying why. `grep -ri "qbank" */src */index.html` returns nothing. Both copy gates and all three builds are green.

## Phase 2: rename the codename locally and on GitHub

> **Two steps need a person.** Windows refuses to rename a folder VS Code holds open, so close the workspace (and any dev server) before the folder renames. And the GitHub renames are done in each repo's Settings page (or `gh repo rename`), which this environment cannot reach without the GitHub CLI. Everything else in this phase is scripted and runs after those two.

- [ ] Rename the five GitHub repos: `psc-archiver-api` to `qbank-api`, `psc-archiver-admin` to `qbank-admin`, `psc-archiver-client` to `qbank-learner`, `psc-archiver-deploy` to `qbank-deploy`, `psc-archiver-workspace` to `qbank-workspace`. Secrets, Actions history and old-URL redirects carry over.
- [ ] Rename the four local folders to match (`qbank-writer` already is); `git remote set-url origin` to the new URL in each (and in this root repo), so nothing relies on the redirect.
- [ ] Admin `mappingTemplates.js`: localStorage keys become `qbank:bulk-import-templates:v1` and `qbank:bulk-import-last-used:v1`.
- [ ] Root repo: `repos.json` (the four names and URLs; the `qbank-writer` entry stays), the workspace file (rename it to `qbank-workspace.code-workspace` and fix the four folder paths), `.gitignore`, `.vscode/settings.json`, `.claude/hooks/doc-sync-reminder.mjs` (three patterns; the writer branch stays), `CLAUDE.md`, `INTEGRATION.md`, `AGENTS.md`.
- [ ] Each of the three older app repos: `package.json` `name`; `Dockerfile` OCI labels; `.claude/hooks/doc-sync-reminder.mjs`; the absolute paths in `CLAUDE.md`; `.github/workflows/deploy.yml` `IMAGE_NAME` (`qbank-api`, `qbank-admin`, `qbank-learner`) and the summary heading. **Not** the `script:` path with `/opt/psc-archiver`; that is Phase 3.
- [ ] `qbank-writer`: only its `.claude/hooks/doc-sync-reminder.mjs` copy (kept byte-identical to the other four), the sibling paths in `CLAUDE.md`, the workspace-file link in `CLAUDE.md` and `README.md`, and its markdown in the sweep below. No code, no package name, no image name.
- [ ] Deploy repo: `compose.local.yml` (`name:`, build contexts, image defaults, the database name in `MONGODB_URI`); `compose.prod.yml` (image defaults only); `.env.example` (`*_IMAGE` and the database name); `scripts/setup-app.sh` `REPO_URL`; the `curl` URL in `README.md`; the hint in `scripts/bootstrap.mjs`; comments. Also the database name in `psc-archiver-api/.env.example`.
- [ ] Doc sweep across all six checkouts (root and five repos): one replace over `**/*.md` for `psc-archiver-(api|admin|deploy|workspace)` to `qbank-$1`, `psc-archiver-client` to `qbank-learner`, `psc-archiver-web` to `qbank-admin`; then read the README, CLAUDE and INTEGRATION headers by hand. Delete the stale `__pycache__/*.pyc` hits under `.claude/skills` and `.opencode/skills`.
- [ ] Verify: `bash sync.sh` from the root clones or pulls all five repos; `docker compose -f compose.local.yml up -d --build` and the seed profile in the deploy repo (with the `writer` service too, if the writer roadmap's Phase 6 has run); `pnpm build` in each app; edit a `src/` file in each of the four app repos and confirm the doc-sync hook still fires; `diff` the five hook copies.
- [ ] Optional, last: rename the root folder and move `~/.claude/projects/c--00-FILES-PROJECTS-2026-psc-archiver*` to the new slug so memory and plans follow.

**Exit criteria:** `grep -rli "psc-archiver" --exclude-dir=node_modules .` from the root returns only `/opt/psc-archiver`, the compose project name, the container names and the volume name (all Phase 3). The local prod-parity stack is green against a database named `qbank`.

## Phase 3: server cutover (one short maintenance window)

Order matters: `deploy.sh` pulls whatever image name the server `.env` names, and nothing on the server changes until this phase.

- [ ] Push the deploy repo with: `compose.prod.yml` `name: qbank`, `container_name: qbank-api` / `qbank-web` / `qbank-learner` (and `qbank-writer` if the `writer` service exists by then), volume `name: qbank-ai-tagging-jobs`; `PROJECT_NAME="qbank"` in `scripts/deploy.sh` and `scripts/deploy-latest.sh`; `/opt/qbank` in `scripts/setup-app.sh`, `README.md` and `QUICKSTART.md`.
- [ ] On the server, with no AI-tagging job in flight: `docker compose -f compose.prod.yml -p psc-archiver down`, `sudo mv /opt/psc-archiver /opt/qbank`, `git pull` there, then in `.env` set `API_IMAGE`, `WEB_IMAGE`, `LEARNER_IMAGE` to the `qbank-*` names (`WRITER_IMAGE`, if present, already is) and the database in `MONGODB_URI` to `qbank`.
- [ ] Push each app repo that deploys (three, or four with `qbank-writer`) with the workflow's `script:` line changed to `/opt/qbank/scripts/deploy.sh ...`; CI builds the first `qbank-*` images. The first boot is `docker compose -f compose.prod.yml -p qbank up -d` (the first-deploy note in `setup-app.sh` explains why `deploy.sh` cannot be first), then the seed profile against the empty `qbank` database; after that CI deploys work normally.
- [ ] Set the new GHCR packages private, matching the old ones, so the server's stored login keeps working.
- [ ] Verify `/api/readyz` through every host and a staff login against the reseeded database.
- [ ] Clean up: `docker volume rm psc-archiver-ai-tagging-jobs`, drop the `pscarchiver` database in Atlas, and after a week delete the old GHCR packages.

**Exit criteria:** every host serves a `ghcr.io/mroshan74/qbank-*` image, and a CI deploy of each deployed service runs green.

## Phase 4: apply the brand (when it is chosen)

- [ ] Change `APP_NAME` in the four `site.js` / constant files (admin, client, api, `qbank-writer`), the Twitter handle, the social links and the support emails.
- [ ] Plan hostnames and DNS as their own roadmap (certificates, `ADMIN_HOST` / `LEARNER_HOST` / `WRITER_HOST`, `CLIENT_URL`).
- [ ] Legal wording that names Kerala PSC as a factual disclaimer stays.

## Risks and non-goals

- **Non-goals:** hostnames, emails, social handles, compose service and Traefik router names, the `pscdatabuilder` seed file names.
- **GHCR package churn:** rolling back to a pre-cutover image needs the old `*_IMAGE` values in `.env`. Keep the old packages a week.
- **Phase 3 discards data.** Everything in the `pscarchiver` database and the old AI-jobs volume is gone after the reseed. Fine while nobody uses the product; revisit this phase if real users arrive before it runs.
- **Claude Code project state** is keyed by the root folder's absolute path; renaming that folder without moving the project directory loses memory and plans for this workspace.
- **The doc-sync hook fails silently** after a folder rename, which is why Phase 2 verifies it by hand, in all five copies.
- **Two roadmaps touch the deploy repo.** The writer roadmap adds a service; this one renames the project. Each phase here says what to do if the writer's deployment phases have already run, and the writer roadmap's non-goals hand the rename to this file. Read both status headers before starting Phase 3.
