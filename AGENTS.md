# AGENTS.md — qbank workspace

Pointer file for AI coding agents (Codex, Claude Code, etc.) launched from the **workspace root**. This is a multi-root VS Code workspace ([qbank-workspace.code-workspace](qbank-workspace.code-workspace)) holding five repos that are **one product**: a Kerala PSC exam-question archiver.

| Project | Role | Start here |
|---------|------|-----------|
| **qbank-api** | Backend — NestJS 11 + MongoDB. Owns the data model, auth, RBAC, and the `/api/config` registry. | [qbank-api/AGENTS.md](qbank-api/AGENTS.md) |
| **qbank-admin** | Staff frontend — Vite + React/JSX. The back office. Ships to `archiver.trynbuild.com`. | [qbank-admin/AGENTS.md](qbank-admin/AGENTS.md) |
| **qbank-learner** | Learner frontend — Vite + React/JSX, mobile-first. Reads only the `/papers/*` consumer surface. Ships to `learner.trynbuild.com`. Branch is **`main`**, not `master`. | [qbank-learner/AGENTS.md](qbank-learner/AGENTS.md) |
| **qbank-writer** | Writer frontend — Vite + React/JSX, Mantine, mobile-first. A fork of the old writer portal (`psc-data-builder/pdb-client`, read-only) on the new API: a writer adds questions to their assigned exam papers and sees only their own work. Calls the staff routes with a `writer` token. Being built: [roadmap](qbank-writer/docs/roadmaps/writer-portal.md). Branch is **`main`**. | [qbank-writer/AGENTS.md](qbank-writer/AGENTS.md) |
| **qbank-deploy** | Infrastructure — Docker Compose, Traefik, deploy/rollback scripts, and the local prod-parity stack. Branch is **`main`**, not `master`. Bringing a server up: [QUICKSTART.md](qbank-deploy/QUICKSTART.md). | [qbank-deploy/README.md](qbank-deploy/README.md) |

## How to work here

- **Inside one repo, that repo's own `AGENTS.md`/`CLAUDE.md` governs.** This root file only adds the layer they can't see: that sibling repos exist and how they connect.
- **Before any change that spans repos, read [INTEGRATION.md](INTEGRATION.md).** It holds the full contract — topology, the contract-first change protocol, and the four seams that must stay in sync.
- **pnpm only** in every repo. Never npm or yarn.
- **One API, three frontends, one origin each.** Each SPA sits behind its own nginx on its own hostname and proxies `/api` to the same never-routed API container (`qbank-writer` gets its host in Phase 8 of its roadmap). A change to one frontend does not automatically apply to the others — but a change to the *API* often touches more than one. The admin and `qbank-writer` share the staff routes (`/api/questions/*`, `/api/exam-papers/*`); the learner app reaches only `/api/papers/*`.

## The rule that bites hardest across the seam

The contract says a frontend consumes the backend's enums + permission registry from **`GET /api/config`** — no parallel constant maps. A full-stack change must keep four things in sync **in the same change**: **enums**, **permissions/RBAC**, **endpoints (apiPaths + service fn)**, and **user-facing copy** — in **every** frontend it touches. If you can only touch one repo, do your side and leave a tagged handoff note (see [INTEGRATION.md → tagging workflow](INTEGRATION.md#the-tagging-handoff-workflow)).

The deployment equivalent: the API's **`CLIENT_URL` replaces** its built-in CORS fallback rather than extending it, so it must name *every* origin. Adding a frontend without updating it silently drops the others.

> ⚠ **Known gap:** today `/api/config` returns enums only and the frontend doesn't consume it yet (it hardcodes copies that have drifted) — mirror enum/permission changes manually on both sides until the wiring lands. See [INTEGRATION.md](INTEGRATION.md).

## User-facing copy: no em dashes, in any repo

**Never ship an em dash in a string a reader sees** — a label, button, hint, placeholder, toast, empty state, page title, meta description, or an API exception message (those render verbatim in a frontend toast). Use a comma, a colon, parentheses, or two sentences. Two exceptions only: an **en dash in a genuine numeric range** (`Questions 1–50`, `A–D`, `70–84%`) and **`—` alone as an empty-value placeholder**; an en dash joining two nouns is neither.

Every frontend gates this with **`pnpm check:copy`** (`scripts/check-copy.mjs`, one allowlist per repo — `licenceLine.js` keeps its dashes because they are a regex character class; `qbank-writer` gets its copy in Phase 1 of its roadmap). The API has no checker; its exception messages are reviewed by hand. **Code comments, JSDoc, log lines and existing markdown keep their dashes** — only what a reader sees is in scope, and this file is not.

Per-repo detail: [qbank-learner/docs/arch/12-user-facing-copy.md](qbank-learner/docs/arch/12-user-facing-copy.md) (learner voice), [qbank-admin/docs/arch/12-user-facing-copy.md](qbank-admin/docs/arch/12-user-facing-copy.md) (staff voice), [qbank-writer/docs/arch/12-user-facing-copy.md](qbank-writer/docs/arch/12-user-facing-copy.md) (writer voice), and seam 4 in [INTEGRATION.md](INTEGRATION.md).

## Planning and roadmaps

**Plan mode produces a roadmap, and roadmaps advance one phase at a time.** A plan made in plan mode is written into the owning repo as **`docs/roadmaps/<feature>.md`** (`doc/roadmaps/` in the API) — phases of `- [ ]` checklist tasks with explicit exit criteria per phase, not left as a chat reply. When implementing: do the **one** phase or task that was asked for, tick its boxes in the roadmap, report what was done, and **stop**. Do not continue into the next phase unless explicitly told to; a request that names several phases or tasks overrides this for those only. Tick a box only when the work is actually done **and** its docs are updated in the same change.

A roadmap that spans repos lives in the repo owning the bulk of the work, names its owner repos up front, and follows [INTEGRATION.md](INTEGRATION.md) for the cross-repo seams. `qbank-deploy` has no agent file of its own — this rule covers it. Worked example: [qbank-learner/docs/roadmaps/README.md](qbank-learner/docs/roadmaps/README.md).

Workspace-wide roadmaps live in [docs/roadmaps/](docs/roadmaps/) here ([rename-to-qbank.md](docs/roadmaps/rename-to-qbank.md)). The writer portal's lives in its own repo, [qbank-writer/docs/roadmaps/writer-portal.md](qbank-writer/docs/roadmaps/writer-portal.md), and also changes this root, `qbank-api` (Phase 7) and `qbank-deploy` (Phases 6 and 8).

## Documentation sync rule

Every code change updates the owning repo's docs **in the same change**. Each repo's `CLAUDE.md`/`AGENTS.md` carries a "Documentation sync rule" mapping code areas to doc files (API: `doc/0X-*.md` + `doc/decisions/`; admin and client: `docs/arch/*` + `docs/features/*` + the shared-atoms manifest; `qbank-writer`: `docs/arch/*` + `docs/features/*` + its roadmap's boxes). New feature → new doc file, indexed. Cross-repo change → every touched repo's docs plus the handoff note per [INTEGRATION.md](INTEGRATION.md).

Deployment changes count: [qbank-deploy/README.md](qbank-deploy/README.md) is authoritative for anything operational (hostnames, compose services, `deploy.sh` arguments, `.env` keys). A frontend's `Dockerfile` / `nginx.conf` / `.github/workflows/` documents itself locally and links there rather than restating it.
