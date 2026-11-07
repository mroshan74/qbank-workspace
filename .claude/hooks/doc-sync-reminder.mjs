// PostToolUse hook (Write|Edit): reminds the agent to apply the repo's
// "Documentation sync rule" whenever a source file changes, the paper lifecycle
// contract (decision 0040) when the file touches papers, and — in the three
// frontends — the no-em-dash copy rule that `pnpm check:copy` enforces.
// Reads the hook payload JSON on stdin; emits additionalContext JSON on stdout.
//
// Advisory only. It never blocks a write: `check:copy` is the hard gate, and a
// hook that fails a save would punish the agent for a rule it can still fix.
//
// Five identical copies of this file exist — one per app repo (api, admin,
// client, qbank-writer) plus the workspace root — each wired by that repo's
// .claude/settings.json. They are hand-kept duplicates, not symlinks: a change
// here must be copied to the other four.
let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return;
  }
  const file = String(payload?.tool_input?.file_path ?? "").replace(/\\/g, "/");
  if (!/\/src\/.+\.(ts|tsx|js|jsx|css)$/i.test(file)) return;
  if (/node_modules|\/dist\//i.test(file)) return;

  let docs;
  let copyRule = "";
  if (/qbank-api\//i.test(file)) {
    docs =
      "qbank-api docs — endpoints/guards: doc/02-modules.md; schemas: doc/03-data-model.md; auth: doc/04-auth.md; enums/permissions: lists in doc/02-modules.md + CLAUDE.md + AGENTS.md; completed planned work: doc/07-future-work.md";
    copyRule =
      " If this change added or edited an exception message (BadRequestException / ConflictException / ForbiddenException), remember it renders verbatim in a frontend toast: no em dashes, no schema field names.";
  } else if (/qbank-admin\//i.test(file)) {
    docs =
      "qbank-admin docs — the matching docs/arch/* file for the area, docs/features/* status if feature scope changed, and docs/arch/11-shared-atoms-manifest.md if a shared atom was added/changed";
    copyRule =
      " If this change touched any user-visible string, apply docs/arch/12-user-facing-copy.md — no em dashes in copy (a comma, a colon, parentheses, or two sentences instead) — and run `pnpm check:copy`.";
  } else if (/qbank-learner\//i.test(file)) {
    docs =
      "qbank-learner docs — the matching docs/arch/* file for the area, docs/features/* status if feature scope changed, and docs/arch/11-shared-atoms-manifest.md if a shared atom was added/changed";
    copyRule =
      " If this change touched any user-visible string, apply docs/arch/12-user-facing-copy.md — no em dashes in copy (a comma, a colon, parentheses, or two sentences instead) — and run `pnpm check:copy`.";
  } else if (/qbank-writer\//i.test(file)) {
    docs =
      "qbank-writer docs — the matching docs/arch/* file for the area, docs/features/* status if feature scope changed, and the boxes in docs/roadmaps/writer-portal.md";
    copyRule =
      " If this change touched any user-visible string, apply docs/arch/12-user-facing-copy.md — no em dashes in copy (a comma, a colon, parentheses, or two sentences instead) — and run `pnpm check:copy`. Every list this app shows must stay keyed on the signed-in writer (assignedTo=me, createdBy=<my id>).";
  } else if (/qbank-homepage\//i.test(file)) {
    docs =
      "qbank-homepage docs — docs/features/marketing-pages.md for any page, section, mockup, header or footer; ARCHITECTURE.md for src/lib/site.js, src/lib/routes.js (plus public/sitemap.xml for a new route) or the theme store";
    copyRule =
      " If this change touched any user-visible string, apply docs/arch/12-user-facing-copy.md — no em dashes in copy (a comma, a colon, parentheses, or two sentences instead) — and run `pnpm check:copy`. The brand, the app URLs, the mailboxes and the social handles come from src/lib/site.js, never a literal; a social constant may be empty and every renderer checks that first.";
  } else {
    return;
  }

  // Paper lifecycle (decision 0040): any code that creates, edits, lists,
  // downloads or changes the status of a paper must stay inside the contract.
  // Any path naming a paper or a download: exam-paper, paper-builder, papers/,
  // question-paper-editor, usePaperActions, paperLifecycle, batch-export...
  const lifecycleRule = /paper|download|batch-export/i.test(file)
    ? " This file touches papers: check the change against the Paper lifecycle contract in INTEGRATION.md (draft-only create, publish needs questions, published -> archived only, final downloads for published papers, published-only visibility, custom paper dates today or later) and go through the lifecycle helper rather than an inline status check."
    : "";

  console.log(
    JSON.stringify({
      suppressOutput: true,
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `Doc-sync reminder: ${file} changed. Per the Documentation sync rule in CLAUDE.md, update the matching documentation in this same change (${docs}) — or note explicitly that no doc covers this change.${copyRule}${lifecycleRule}`,
      },
    }),
  );
});
