# CLAUDE.md — qbank workspace

Guidance for Claude Code launched from the **workspace root**. This multi-root VS Code workspace ([qbank-workspace.code-workspace](qbank-workspace.code-workspace)) holds six repos that make up one product, QFoundry: a Kerala PSC exam-question archiver and practice platform.

| Project | Role | Deep guide |
|---------|------|-----------|
| **qbank-api** | Backend — NestJS 11 + MongoDB. Owns the data model, auth, hybrid RBAC, and the public `/api/config` enum + permission registry. | [qbank-api/CLAUDE.md](qbank-api/CLAUDE.md) |
| **qbank-admin** | Staff frontend — Vite + React/JSX, pnpm/shadcn/Datadog-style UI. The back office. Ships to `studio.qfoundry.in`. | [qbank-admin/CLAUDE.md](qbank-admin/CLAUDE.md) |
| **qbank-learner** | Learner frontend — Vite + React/JSX, mobile-first. Reads only the `/papers/*` consumer surface; a learner's token cannot reach the admin routes. Ships to `prep.qfoundry.in`. | [qbank-learner/CLAUDE.md](qbank-learner/CLAUDE.md) |
| **qbank-writer** | Writer frontend — Vite + React/JSX, Mantine, mobile-first. A fork of the old writer portal (`psc-data-builder/pdb-client`, read-only) on the new API: a writer adds questions to the exam papers assigned to them and sees only their own work. Calls the staff routes with a `writer` token. **Being built**, roadmap [qbank-writer/docs/roadmaps/writer-portal.md](qbank-writer/docs/roadmaps/writer-portal.md). Branch **`main`**. | [qbank-writer/CLAUDE.md](qbank-writer/CLAUDE.md) |
| **qbank-homepage** | Marketing site — Vite + React/JSX, shadcn/Tailwind, **static**: the landing, pricing, about, contact and legal pages at `qfoundry.in`. Calls no API, holds no session, links out to the three apps. Carved out of `qbank-admin` on 2026-11-07. Branch **`main`**. | [qbank-homepage/CLAUDE.md](qbank-homepage/CLAUDE.md) |
| **qbank-deploy** | Infrastructure — Docker Compose, Traefik, deploy/rollback scripts, and the local prod-parity stack. Deliberately outside the app repos so the server cannot drift from git. | [qbank-deploy/README.md](qbank-deploy/README.md) |

**One API, three app frontends and a static homepage, one origin each.** Each SPA sits behind its own nginx on its own hostname and proxies `/api` to the same never-routed API container — two SPAs cannot both own `/` behind one origin. The hosts are `qfoundry.in` (homepage, with `www.` redirecting to it), `studio.qfoundry.in` (admin), `prep.qfoundry.in` (learner) and `writer.qfoundry.in` (writer); the server-side cutover is Phase 4 of [docs/roadmaps/qfoundry-brand-and-hostnames.md](docs/roadmaps/qfoundry-brand-and-hostnames.md). A consequence worth remembering: the API's `CLIENT_URL` **replaces** its built-in CORS fallback rather than extending it, so it must name *every* app origin (the homepage calls no API and is left out).

## Scope of this file

- **Working inside a single repo? That repo's own `CLAUDE.md` is authoritative.** This root file only adds the cross-project layer — it never overrides a sub-project's house rules.
- **For any change that crosses the seam, [INTEGRATION.md](INTEGRATION.md) is the contract** (topology, contract-first protocol, the four sync seams, known quirks). Don't duplicate it — link to it.
- **pnpm only** in every repo. Never npm or yarn.

## Cloning / syncing every repo in one go

This workspace root is its own lightweight git repo (`github.com/mroshan74/qbank-workspace`) that tracks only meta files — docs, workspace/editor config, and the sync tooling below. It never tracks the contents of `qbank-api/`, `qbank-admin/`, `qbank-learner/`, `qbank-deploy/`, `qbank-writer/` or `qbank-homepage/` (see `.gitignore`); each of those stays a fully independent repo with its own remote, branch, and history.

- [repos.json](repos.json) — manifest of the six repos (name, clone URL, branch). **Branches differ:** `master` for the api and admin, **`main`** for the client, the deploy repo, `qbank-writer` and `qbank-homepage`. `repos.json` is the authority; check there rather than assuming.
- [sync.sh](sync.sh) — run `bash sync.sh` to clone whichever repos are missing and `git pull --ff-only` whichever already exist, in one command. Plain bash (no jq/node dependency) so it runs unmodified on Windows (Git Bash), macOS, and Linux. It never merges or overwrites local work — a repo with diverging or uncommitted changes is left alone and flagged in the summary.

On a fresh machine: clone this root repo, then run `bash sync.sh` from it to pull down all six repos. The deploy repo's compose build contexts are `../<repo>`, so they must all sit side by side.

## Run the full stack

**For development** (hot reload, one terminal per app; run whichever frontends you need):

```bash
# backend — :5000, global prefix /api
cd qbank-api && pnpm install && pnpm run start:dev

# staff frontend — Vite dev on :5173, targets VITE_BACKEND_URL (http://localhost:5000)
cd qbank-admin && pnpm install && pnpm run dev

# learner frontend — Vite dev on :3000, strictPort. It refuses to wander to 3001
# on purpose: the API's CLIENT_URL allows :3000 by name, so a silent port bump
# would be rejected by CORS and read as a backend fault.
cd qbank-learner && pnpm install && pnpm run dev

# writer frontend — Vite dev on :5180, strictPort (from Phase 1 of its roadmap).
# Unlike the other two it is NOT cross-origin: Vite proxies /api to :5000.
cd qbank-writer && pnpm install && pnpm run dev

# homepage — Vite dev on :5190, strictPort. Static: it never calls the API, so
# it needs neither the backend running nor a CLIENT_URL entry.
cd qbank-homepage && pnpm install && pnpm run dev
```

The admin and learner dev origins must be named in the API's `CLIENT_URL`, or leave it unset and take the fallback (`http://localhost:5173,http://localhost:3000`) — setting it **replaces** that list. `qbank-writer` needs no entry: its dev server proxies `/api`, so the browser never makes a cross-origin call.

**To see or demo it as production runs it** (each SPA single-origin behind real nginx, its own throwaway MongoDB, no hot reload) — use this whenever a change involves the `/api` proxy, the containers, or the deploy setup:

```bash
cd qbank-deploy
docker compose -f compose.local.yml up -d --build
docker compose -f compose.local.yml --profile seed run --rm seed   # safe to re-run
# → http://localhost:8080  (admin)
# → http://localhost:8081  (learner)
# → http://localhost:8082  (writer)
# → http://localhost:8083  (homepage)
```

That seed step runs `qbank-deploy/scripts/bootstrap.mjs` inside the api image and covers the System organization, the superadmin, the taxonomy and all 163 papers. It is idempotent. **The server uses the identical profile against `compose.prod.yml`**, so this rehearses the real bootstrap rather than a local approximation — the server runbook, commands only, is [qbank-deploy/QUICKSTART.md](qbank-deploy/QUICKSTART.md).

> This stack is the **only** place two things get exercised before a server sees them, because `pnpm dev` covers neither: each SPA's single-origin `/api` proxy, and the learner app's PDF fonts, fetched over HTTP from `/fonts/` at render time — one of them named `Century Schoolbook Std Regular.otf`, spaces and all. A 404 there kills every Malayalam export and there is no CDN fallback.

## Cross-project contract in one line

The frontends are meant to read enums + permissions from **`GET /api/config`** (never hardcode them). A full-stack change keeps four seams in sync in the same change — **enums, permissions/RBAC, endpoints (`apiPaths` + service fn), user-facing copy** — across **every** frontend the change touches, and, when only one repo is touched, leaves a tagged handoff note for the others. Details and file paths: [INTEGRATION.md](INTEGRATION.md).

> ⚠ **Known gap:** today `/api/config` returns enums only and the frontend doesn't consume it yet — enum/permission changes must be mirrored manually on both sides in the same change. See the "Current state vs target" note in [INTEGRATION.md](INTEGRATION.md).

## User-facing copy: no em dashes, in any repo

**Never ship an em dash in a string a reader sees** — a label, button, hint, placeholder, toast, empty state, page title, meta description, or an API exception message (those render verbatim in a frontend toast). Use a comma, a colon, parentheses, or two sentences. A screen peppered with em dashes reads as machine-written at a glance.

Two exceptions only: an **en dash in a genuine numeric range** (`Questions 1–50`, `A–D`, `70–84%`) and **`—` alone as an empty-value placeholder**. An en dash joining two nouns is neither.

Every frontend gates this with **`pnpm check:copy`** (`scripts/check-copy.mjs`, one allowlist per repo — `licenceLine.js` keeps its dashes because they are a regex character class; `qbank-writer` gets its copy in Phase 1 of its roadmap). The API has no checker; its exception messages are reviewed by hand. **Code comments, JSDoc, log lines and existing markdown keep their dashes** — only what a reader sees is in scope, and this file is not.

Per-repo detail: [qbank-learner/docs/arch/12-user-facing-copy.md](qbank-learner/docs/arch/12-user-facing-copy.md) (learner voice), [qbank-admin/docs/arch/12-user-facing-copy.md](qbank-admin/docs/arch/12-user-facing-copy.md) (staff voice), [qbank-writer/docs/arch/12-user-facing-copy.md](qbank-writer/docs/arch/12-user-facing-copy.md) (writer voice), and seam 4 in [INTEGRATION.md](INTEGRATION.md).

## Paper lifecycle: one set of rules, in every repo

**Any feature that creates, edits, lists, downloads, shares or changes the status of a paper must follow the [Paper lifecycle contract in INTEGRATION.md](INTEGRATION.md#paper-lifecycle-contract), and answer its "Before building a feature that touches papers" checklist before code is written.** In short:

- A paper is always created as a draft.
- Draft → published needs at least 1 question. Published → archived only, never back to draft. Archived → republish or delete; archived → draft is superadmin only.
- The one exception: an original exam paper (`exam_paper`) moves back to draft in one step from published or archived, with `exam-paper:reopen` (admin by default, superadmin implicitly). Custom papers never do. Decision [0041](qbank-api/doc/decisions/0041-exam-paper-reopen.md).
- Exam Papers lists original exam papers only, and custom papers have their own Custom Papers page.
- Only published papers with questions download as a final copy (a superadmin may download any status), and only published papers are visible to another organization or a learner.
- Editing is for drafts. A custom paper's date of exam is today or later; an original exam paper may carry a past date.

The API enforces it (decision [0040](qbank-api/doc/decisions/0040-paper-lifecycle-rules.md)); the admin app mirrors it in one helper and only hides what the API would refuse, and `qbank-writer` carries a port of that helper for the same purpose. Rollout status: [paper-lifecycle-rules.md](qbank-api/doc/roadmaps/paper-lifecycle-rules.md).

## Planning and roadmaps

**Plan mode produces a roadmap, and roadmaps advance one phase at a time.** A plan made in plan mode is written into the owning repo as **`docs/roadmaps/<feature>.md`** (`doc/roadmaps/` in the API) — phases of `- [ ]` checklist tasks with explicit exit criteria per phase, not left as a chat reply. When implementing: do the **one** phase or task that was asked for, tick its boxes in the roadmap, report what was done, and **stop**. Do not continue into the next phase unless explicitly told to; a request that names several phases or tasks overrides this for those only. Tick a box only when the work is actually done **and** its docs are updated in the same change.

A roadmap that spans repos lives in the repo that owns the bulk of the work, names its owner repos up front, and follows [INTEGRATION.md](INTEGRATION.md) for the cross-repo seams. `qbank-deploy` has no `CLAUDE.md` of its own — this rule covers it. Worked example: [qbank-learner/docs/roadmaps/README.md](qbank-learner/docs/roadmaps/README.md).

A roadmap that belongs to the workspace as a whole (every repo at once, or the meta files here) lives in [docs/roadmaps/](docs/roadmaps/) in this root repo. Current: [rename-to-qbank.md](docs/roadmaps/rename-to-qbank.md), the plan to rename the repos from `psc-archiver-*` to `qbank-*` and to decouple the user-visible brand from the code first. Next: [qfoundry-brand-and-hostnames.md](docs/roadmaps/qfoundry-brand-and-hostnames.md), the plan to apply the chosen brand (QFoundry, `qfoundry.in`), move the hosts to `qfoundry.in` / `studio.` / `prep.` / `writer.`, and carve the marketing pages out of the admin app into a sixth repo, `qbank-homepage`. It supersedes the rename roadmap's Phase 4.

The writer portal's roadmap lives in the repo that owns most of its work: [qbank-writer/docs/roadmaps/writer-portal.md](qbank-writer/docs/roadmaps/writer-portal.md). It also changes the workspace root (Phase 0), `qbank-api` (Phase 7, server-side writer limits) and `qbank-deploy` (Phases 6 and 8).

## Documentation sync rule

Every code change updates the owning repo's docs **in the same change** — docs are part of the definition of done. Each repo's `CLAUDE.md` carries a "Documentation sync rule" table mapping code areas to doc files (API: `doc/0X-*.md` + `doc/decisions/`; admin and client: `docs/arch/*` + `docs/features/*` + the shared-atoms manifest; `qbank-writer`: `docs/arch/*` + `docs/features/*` + its roadmap's boxes). A new feature gets a new doc file, indexed in the repo's doc README. A cross-repo change updates every touched repo's docs plus the handoff note per [INTEGRATION.md](INTEGRATION.md).

**Deployment changes are documentation changes too.** `qbank-deploy/README.md` is the authoritative reference for anything operational — hostnames, compose services, `deploy.sh` arguments, `.env` keys. A frontend repo's `Dockerfile` / `nginx.conf` / `.github/workflows/` documents itself locally (the client's is under `ARCHITECTURE.md → Deployment`) and links there rather than restating it.

A `PostToolUse` hook (`.claude/hooks/doc-sync-reminder.mjs`, six identical copies — the root, api, admin, client, `qbank-writer` and `qbank-homepage` — each wired in that repo's `.claude/settings.json`) re-injects this rule automatically whenever a source file under a repo's `src/` is written or edited.
