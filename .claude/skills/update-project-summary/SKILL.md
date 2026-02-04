---
description: Regenerate the Project Summary section in CLAUDE.md by exploring the current codebase
---

Update ONLY the `## Project Summary` section in `CLAUDE.md` — the content between the `<!-- regenerate with /update-project-summary -->` and `<!-- end project summary -->` markers. Do NOT modify any other section.

## What to capture

The summary exists so that future sessions understand how the system is built without exploring the entire codebase. Every line must earn its place.

### Required sections

1. **Feature table** — one row per directory under `app/features/`. Columns: Feature, Path, Purpose (1 line max). Include sub-feature counts where relevant.

2. **Key stores** — list ONLY stores that hold significant state (config stores, runtime state stores). Format: `relative/path/to/store.ts` with parenthetical purpose. Skip trivial stores.

3. **Key composables** — list composables that are entry points or widely used across features. Skip internal/helper composables.

4. **Layouts** — list all files in `app/layouts/` with format name.

5. **Pages** — group by top-level route (`admin/`, `donor/`, `portal/`) with 1-line description each.

### How to gather

1. `ls app/features/` — list all feature directories
2. For each feature: check for `stores/`, `composables/`, `shared/types.ts`, and count sub-features if nested
3. `ls app/layouts/` — list layouts
4. `ls -R app/pages/` — map page routes

### Rules

- Be CONCISE. No prose. No filler words. Table + bullet lists only.
- Preserve the HTML comment markers exactly.
- Do not add explanations of architecture (that's in the Architecture section).
- Do not duplicate information already in `.claude/rules/` path-scoped files.
- If a feature is new, add it. If a feature was removed, delete it. If key files changed, update the paths.
