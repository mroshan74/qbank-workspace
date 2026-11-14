# Testing fixes, November 2026

**Status:** Phases 0, 1, 3 and 4 complete (Phase 1's check on prep is owed by the owner). Phase 2 not started. **Next: Phase 2.**

**Owner repos:** `qbank-api` (Phases 1 and 2), `qbank-admin` (Phases 2, 3 and 4), `qbank-learner` (Phase 2), `qbank-deploy` (Phase 1, only if the cause is operational) and this root repo (this file, plus `INTEGRATION.md` in Phases 2 and 3).

> **One phase at a time.** Do the **one** phase that was asked for, tick its boxes, report what was done, and **stop**. Do not continue into the next phase unless explicitly told to. A request that names several phases overrides this for those only. Tick a box only when the work is done **and** its docs are updated in the same change. Each phase is committed on its own, in every repo it touches, on that repo's branch (`master` for api and admin, `main` for learner, deploy and root). Nothing is pushed, because a push deploys.

## Context

Testing on 2026-11-14 turned up four issues. Each is its own phase, numbered as reported:

1. **Telegram connect link "expired" on first try.** Connecting a Telegram channel gives a link the bot calls expired. Cancelling and pressing Connect a channel again gives a link that works.
2. **A trace code is minted on every download.** Repeat downloads of the same paper by the same user each get a new code, staff and learners alike. That floods the trace lookup and the download dashboard.
3. **Telegram is buried in Workspace settings.** It is the core selling point. It should be in the main menu next to Analytics and Leads, as Integrations > Telegram.
4. **The sidebar icons look randomly coloured.** Clients find the per-area icon colours odd. They should all be white.

**Execution order:** 0 → 1 → 4 → 3 → 2. The small items go first. Phase 3 builds on Phase 4's sidebar change. Phase 2 is the biggest and crosses three repos.

## Decisions taken up front

- **D1 (Phase 2) Key.** There is one trace code per (paper, user) for **final** downloads, whatever the edition. Draft **previews** keep their own single code per (paper, user, `kind: preview`).
- **D2 (Phase 2) Edition metadata, not "latest".**
  - The row keeps per-edition counters: `profileCounts {print, mobile}` and `modeCounts {paper, both, key}`.
  - **The headline download metric counts only downloads that contain the paper** (`paper` and `both`). An answer-key-only download is tracked in `modeCounts.key` but not counted as a paper download.
  - The print/phone split exists to tune print layout to user preference. The content-type split is nice to have.
- **D3 (Phase 2) Republish.** A republish gives a new code. The paper gets a `contentRevision`, bumped on every draft → published transition in `changeStatus` (`qbank-api/src/exam-papers/exam-papers.service.ts`). A code is reused only while the revision matches. Archived → republish, which involves no edit, does not bump it.
- **D4 (Phase 4) Monochrome sidebar icons.** They are muted at rest and white on hover and when active. The area colour stays on the page-title chip and the stat tiles. This amends admin visual refresh D2: "three places" becomes "two places".
- **D5 (Phase 3) Integrations > Telegram.**
  - The main menu gets a top-level **Integrations** group with one child, **Telegram**, at `/integrations/telegram`.
  - It sits in the same group as Analytics and Leads, with section `NEUTRAL`.
  - The old URL `/settings?section=telegram` redirects to it.

---

## Phase 0: roadmap

- [x] Write this file.
- [x] Index it in the root [CLAUDE.md](../../CLAUDE.md) ("Planning and roadmaps").

**Exit:** this roadmap is in the root repo and indexed.

## Phase 1: Telegram connect link "expired" on first try

**Findings (investigation of 2026-11-14):**

- Minting, the 15-minute TTL and both checks are correct (`qbank-api/src/telegram/telegram-channels.service.ts`, `createLinkCode`, `tryRedeemLinkCode`, `onChatShared`). Times are in milliseconds, the comparisons are not reversed, the TTL index is sound, and every call creates a fresh row.
- The admin side uses a `useMutation` (`qbank-admin/src/pages/settings/hooks/useTelegramChannels.js`), so no stale link is cached.
- The bot replies "This link has expired or was already used" from **two** places, and neither writes a log line:
  - the router fallback in `telegram-update-router.service.ts`, when the `/start` code is not in *this* API's database;
  - `onChatShared` in `telegram-channels.service.ts`, when the picker's `request_id` matches no valid code.

**Hypotheses:**

- **H2 (most likely): two APIs poll one bot.**
  - Since 2026-11-14 the server (prep) and the local stack (`qbank-deploy/.env`) hold the **same** bot token.
  - Two APIs long-poll one bot and take turns after each 409 conflict (a 30 s back-off).
  - A `/start` can land on the API whose database does not hold the code. The retry then lands on the right one.
- **H1: a stale picker.** A "Choose a channel" reply keyboard from an earlier attempt, or a repeat redeem that rotates `requestId`, sends a `request_id` that no longer matches. The "expired" reply also removes the keyboard, which is why the retry works.

**Result (2026-11-14): H2, confirmed.** The prod database cannot be read from here, so the failed row was not looked at. The local stack showed the cause directly instead: its API was polling the same bot as prep, with 106 `409` conflicts in six hours (the last at 15:15 UTC, minutes before the check), and no link codes or channels of its own since 2026-11-11. So a `/start` that reached the local API looked for prep's code in the local database and was answered "expired", and the retry happened to reach prep. H1 was not seen, but it is real in the code and is hardened anyway.

**Tasks:**

- [x] **Diagnose first.** The result is recorded above.
- [x] **Hardening (lands either way)**, in `qbank-api/src/telegram/`:
  - `tryRedeemLinkCode` keeps the existing `requestId` when the same sender redeems the same code again.
  - On a `request_id` mismatch, `onChatShared` matches the sender's newest open code and connects with it. That is safe because every picker asks for the same rights and the sender redeemed that code themselves. It answers "expired" only when there is no open code.
  - Both "expired" branches (`onChatShared` and the router's `/start` fallback) log which one fired, never the code.
- [x] **H2:**
  - `qbank-deploy/compose.local.yml` passes `TELEGRAM_UPDATES_ENABLED` (default `true`), and the local `.env` sets it to `false` while it shares prep's bot. The local API now logs "Telegram updates are off".
  - `telegram-updates.service.ts` logs the `409` as an error that says what it breaks and how to fix it.
  - `qbank-deploy/README.md` (the local stack's Telegram note) is updated.
- [x] **Docs:**
  - `qbank-api/doc/02-modules.md` (the update loop and the linking steps)
  - `qbank-api/doc/03-data-model.md` (`requestId`)
  - `qbank-api/doc/roadmaps/telegram-integration.md` (a dated note under Phase 1)
  - `qbank-admin/docs/features/telegram.md` needed nothing: the admin's copy did not change.
- [x] **Commit** in `qbank-api` and `qbank-deploy`.

**Exit:**

- [x] `pnpm run probe:telegram-bot-chat` (the stand-in bot, on the Docker stack) covers the repeat-redeem and stale `request_id` cases: **23 of 23 passed**.
- [ ] **Owed by the owner, on prep:** a fresh "Connect a channel" link connects on the first try. The local stack no longer polls, so this should hold before the API change is deployed. The hardening reaches prep with the next API deploy.

## Phase 2: one trace code per paper per user

This overturns three earlier rules:

- the per-download granularity of decisions [0021](../../qbank-api/doc/decisions/0021-exam-paper-download-log.md) and [0031](../../qbank-api/doc/decisions/0031-server-minted-trace-code.md);
- the "aggregate, never increment" rule in [0061](../../qbank-api/doc/decisions/0061-share-links-and-consented-leads.md) D4.

It gets a new decision, **`qbank-api/doc/decisions/0071-one-trace-code-per-paper-per-user.md`**, which amends all three. The pattern has a precedent in the `Lead` row with `touches` (0061 D5).

### API (`qbank-api`)

- [ ] **Schema** (`src/exam-papers/schemas/exam-paper-download/exam-paper-download.schema.ts`):
  - New fields:
    - `downloadCount` (counts `paper` and `both` downloads)
    - `modeCounts {paper, both, key}`
    - `profileCounts {print, mobile}`
    - `lastDownloadedAt`
    - `contentRevision`
    - `recentClaims` (a capped array of claim nonces)
    - `traceIdAliases[]` (old codes folded in by the migration)
  - A partial unique index on `{examPaperId, downloadedBy, kind, contentRevision}` for rows with a user.
  - A multikey index on `traceIdAliases`.
- [ ] **Paper schema:** add `contentRevision` (default 0). `changeStatus` bumps it on draft → published.
- [ ] **Claim** (staff `ExamPapersService.claimDownload`, learner `PapersService.claimDownload`):
  - Look up the row for (paper, caller, kind, paper's `contentRevision`) and return its `traceId` if found. Otherwise mint one with `generateTraceId` (`src/common/trace-id.ts`).
  - Also return a random `claimId` nonce. This stays stateless: no claims table.
- [ ] **Record** (`ExamPapersService.recordDownload`):
  - Upsert keyed on `traceId`, filtered on `recentClaims: {$ne: claimId}`.
  - On insert, `$setOnInsert` as today.
  - On every record:
    - `$inc` `downloadCount` (unless the mode is `key`), `modeCounts.<mode>` and `profileCounts.<profile>`
    - `$set` `lastDownloadedAt`
    - `$push` the `claimId` to `recentClaims` with `$slice: -20`
  - A retry with the same `claimId` is a no-op, which keeps 0031's retry safety.
  - Share-link attribution stays first-wins.
- [ ] **Reads:**
  - `lookupDownload` matches `traceId` or `traceIdAliases`.
  - `downloadsSummary`, `downloadCountsByShareLink` and the organization usage counts (`organizations.service.ts`) use `$sum: '$downloadCount'`.
  - `byMode` and `byProfile` come from the counters.
  - The time series buckets by `lastDownloadedAt`, and that caveat is documented.
  - The DTOs expose `downloadCount`, `lastDownloadedAt`, `modeCounts` and `profileCounts`.
- [ ] **Telegram channel post** (`telegram-posts.service.ts`): reuses the poster's code like any other staff download. 0071 notes that one code then covers the poster's own copies and the channel post.
- [ ] **Migration:** `src/scripts/collapse-download-traces.ts`, modelled on `migrate-question-source-types.ts`. It is dry-run by default, writes only with `--apply`, is safe to re-run, and gets a `package.json` script.
  - Group by (paper, user, kind) and keep the earliest row.
  - Sum the counters and move the other rows' codes into `traceIdAliases`. Those codes are printed on PDFs in the wild and must still resolve.
  - Then delete the duplicates.
- [ ] **Tests:**
  - claim reuse, and a new code after a republish
  - a retry does not double count
  - a key-only download is not counted as a paper download
  - an alias lookup resolves
- [ ] **Docs:**
  - decision 0071
  - amending notes in 0021, 0031 and 0061
  - `doc/07-future-work.md`
  - the API's downloads doc
  - `INTEGRATION.md`: `claimId` on the claim response and the record body, and the new response fields
- [ ] **Commit** in `qbank-api` and the root.

### Admin (`qbank-admin`)

- [ ] Send `claimId` from every claim → record caller:
  - `usePaperEditor.js`
  - `usePaperDownload.js` and `exportPaperPdf.js`
  - `runBatchExport.js`
  - `usePostToTelegram.js`
- [ ] **Download history** (`pages/analytics/DownloadHistory.jsx`, `DownloadsTableRow`, `DownloadKpis`, `TopPapersTable`, `TopDownloadersTable`, `modals/download-history/*`):
  - show a count and the last-downloaded date per code, with an edition breakdown in the row detail;
  - the KPIs read "Downloads" (the sum) and "Copies" (the number of codes).
- [ ] **Docs:** the downloads and analytics feature docs and the `apiPaths` entry. Then `pnpm lint`, `pnpm build` and `pnpm check:copy`, and commit.

### Learner (`qbank-learner`)

- [ ] Pass `claimId` in `src/pages/paper/hooks/usePaperDownload.js` on all three record paths: save to device, Send to my Telegram, and the Mini App file.
- [ ] Update the comment and copy in `pages/downloads/DownloadsPage.jsx`. "Minted per download" no longer holds: a re-download keeps the same code.
- [ ] **Docs** in `docs/features/*`. Then `pnpm lint`, `pnpm build` and `pnpm check:copy`, and commit.

**Exit**, checked on the prod-parity stack (127.0.0.1:8080 admin, :8081 learner):

- **Repeat downloads:** one user downloads the same published paper three times (print, phone, key only). That gives one code, `downloadCount` 2 and `modeCounts.key` 1.
- **Lookup:** the lookup finds that code. After the migration, it also finds an old code that was folded in as an alias.
- **Republish:** republishing a reopened original exam paper gives a new code on the next download.
- **Retry:** a forced retry of record does not double count.
- **Dashboard:** its totals match the counter sums.

## Phase 3: Integrations > Telegram in the main menu

- [x] `src/utils/routeLinks.js`: `INTEGRATIONS_LINK = "/integrations"` and `TELEGRAM_LINK = "/integrations/telegram"`.
- [x] `src/components/sidebar/navConfig.js`:
  - In `mainLinks`, after Leads, an **Integrations** group (`Plug`, `SECTION.NEUTRAL`, no gate of its own).
  - Its one sub-item is **Telegram** (`Send`, `requires: { anyPerm: ["telegram:manage"] }`).
  - `telegram:manage` is off the Workspace settings entry's gate.
- [x] **Moved the page** with `git mv`.
  - `src/pages/settings/sections/telegram/TelegramSection.jsx` became `src/pages/integrations/telegram/TelegramPage.jsx`, with its three `components/` and the two hooks under `hooks/`.
  - The page shell is `Container`, `PageBreadcrumb` (Integrations / Telegram), `HeaderTitle` (the old hint is its subtitle; the chip comes from the nav entry) and one `Panel` in place of `SettingsPanel`.
  - The `TELEGRAM_QUERY_KEY` import in `usePostToTelegram.js` is fixed.
- [x] **Router and settings:**
  - `App.jsx`: `/integrations/telegram` is gated `RequireAccess anyPerm ["telegram:manage"]`, and `/integrations` lands on it.
  - The old `/settings?section=telegram` is redirected by `src/pages/settings/components/TelegramSettingsRedirect.jsx`, a layout route **outside** the settings gate, so an account holding only `telegram:manage` follows an old link to Telegram, not to the Dashboard.
  - `telegram` is gone from the settings `SECTIONS` map and `SETTINGS_NAV_GROUPS`, and `telegram:manage` from the settings route gate.
  - The Settings subtitle never named Telegram, so it is unchanged.
- [x] **Links and copy:**
  - `PostToTelegramContent.jsx`: both links go to `TELEGRAM_LINK`, and "Open Telegram settings" is now "Connect a channel".
  - The quiz toast in `usePostToTelegram.js` now reads "Follow it under Integrations, Telegram."
  - The comments in `telegramLabels.js`, `events/listeners.js`, `PostToTelegramModal.jsx` and `useTelegramChannels.js` are updated.
- [x] **Docs:**
  - `docs/features/telegram.md`: a dated note, the file table, the route row and the copy list
  - `docs/features/settings.md`: the table row is removed and the Telegram section is replaced by a note on where it went
  - `docs/features/README.md`
  - `docs/arch/03-routing-auth.md`: the route tree and the settings gate
  - `docs/arch/04-event-bus.md`
  - `docs/arch/08-layout-navigation.md`: the sidebar tree, which also fixes the stale "Settings" line, and the Sections table
  - root `INTEGRATION.md`: one line in the Telegram status
- [x] `eslint` (no errors; one warning that was already there), `pnpm check:copy` (796 files) and `pnpm build` all pass.
- [x] **Added on review:** a vendor-specific "no bot" message. The owner, as superadmin, opened the page on the dev API (which has no bot token) and read the customer's line, "Get in touch with us to turn it on", which looked like a permission problem. `telegramNotSetUp(isVendorWorkspace)` in `telegramLabels.js` now gives the vendor "This server has no Telegram bot. Telegram is off for every organization until the bot is added to this server's settings." on the page and in the Post to Telegram dialog, and the customer keeps the old line. Checked in the browser with the status answer stubbed: 2 of 2. `docs/features/telegram.md` is updated.
- [x] Commit in `qbank-admin` and the root, approved by the owner.

**Exit:** a Playwright walk on the rebuilt local stack passed 10 of 10 checks.

- [x] The QA Client's owner sees Integrations > Telegram in Main next to Analytics and Leads, and the page loads with its channel and recent posts.
- [x] A member sees no Integrations group, and `/integrations/telegram` sends them to the Dashboard.
- [x] `/settings?section=telegram` and `/integrations` both land on the Telegram page, and Workspace settings has no Telegram entry.
- [x] "Connect a channel" in the empty Post to Telegram dialog links to `TELEGRAM_LINK`. Checked in code: the QA Client has a channel, so the dialog's empty state was not walked.

## Phase 4: monochrome sidebar icons

- [x] Remove the `sectionSidebarIconClass(section)` call in `qbank-admin/src/components/sidebar/NavItem.jsx` and `ExpandableNavItem.jsx`, so the icon follows the label's colour states. *`Sidebar.jsx` no longer passes `section` to either. The `section` field stays on nav entries, because `findNavEntry` gives each page its title chip from it.*
- [x] Drop `SECTION_SIDEBAR_ICON` / `sectionSidebarIconClass` from `src/lib/sections.js` and the `--section-*-sidebar` tokens from `src/index.css`: 6 `@theme` lines, 6 light values and 5 Black overrides. Grep found no other reader.
- [x] **Docs:**
  - D2 in `docs/roadmaps/admin-visual-refresh.md`, amended with a dated note
  - `docs/arch/08-layout-navigation.md`: the Sections rule ("two places") and the NavItem icon
  - `docs/arch/06-components.md`: the section token table
  - `DESIGN.md`: the "two places" list
  - `docs/arch/11-shared-atoms-manifest.md`: the `lib/sections.js` row
  - `docs/features/dashboard.md`
  - the comments in `navConfig.js`, `sections.js` and `index.css`
- [x] `eslint` on the changed files, `pnpm check:copy` (795 files) and `pnpm build` all pass.
- [x] Commit in `qbank-admin`, approved by the owner.

**Exit:**

- [x] On the local stack (Light, the default Indigo sidebar), every sidebar icon is monochrome. Measured: the only icon colours are the label's at rest (`oklch(0.78 0.025 285)`), white on the active row, and the profile card's bell icon. Black already resolved the tints to `currentColor`, so nothing changes there. The other five sidebar presets share the same tokens.
- [x] The stat tiles keep their colours. Title chips are painted by `sectionChipClass`, which is untouched.

---

## Verification (each phase)

- **API:** `pnpm test` and `pnpm build` in `qbank-api`.
- **Frontends:** `pnpm lint && pnpm build && pnpm check:copy`.
- **End to end:** in `qbank-deploy`, run `docker compose -f compose.local.yml up -d --build`, then test on 127.0.0.1:8080 (admin) and :8081 (learner).
- **Telegram (Phase 1):** needs the real bot on prep. The local stack shares that token, so stop the local API while testing prep.

## Risks and non-goals

- **Lost per-download history.** After Phase 2, each repeat download no longer keeps its own timestamp; only the first and last are kept. The time-series chart changes meaning, and 0071 documents that.
- **The migration is irreversible** once duplicates are deleted. Run the dry run against a copy first. The aliases make sure no printed code stops resolving.
- **Phase 1 may be partly operational (H2).** The code hardening is still worth landing.
- **Phase 3:** existing bookmarks rely on the redirect. A role holding only `telegram:manage` loses Settings access, which is intended.
- **Non-goals:**
  - a Cancel endpoint that ends a link code early
  - more integrations under Integrations
  - restyling the title chips or stat tiles
  - pushing or deploying any repo
