---
description: Regenerate the Project Summary section in CLAUDE.md and audit .claude/rules/ files
---

## Part 0: Review Recent Changes

Before updating anything, run `git log -5` to read the last 5 commits with full messages. Use this context to:

1. **Update Continuous Learning** — if any commit introduced a durable, reusable insight (non-obvious pattern, gotcha, architectural decision), add or merge it into the `<!-- continuous learning notes -->` section of `CLAUDE.md`. Follow existing bullet style (1 line, ~100 chars). Never duplicate — merge with existing bullets when related.
2. **Inform Parts 1 & 2** — use commit history to spot new features, removed features, renamed files, or shifted patterns that the project summary and rules files should reflect.

## Part 1: Update Project Summary

Update ONLY the `## Project Summary` section in `CLAUDE.md` — the content between the `<!-- regenerate with /update-project-summary -->` and `<!-- end project summary -->` markers. Do NOT modify any other section.

### What to capture

The summary exists so that future sessions understand how the system is built without exploring the entire codebase. Every line must earn its place.

#### Required sections

1. **Feature table** — one row per directory under `app/features/`. Columns: Feature, Path, Purpose (1 line max). Include sub-feature counts where relevant.

2. **Key stores** — list ONLY stores that hold significant state (config stores, runtime state stores). Format: `relative/path/to/store.ts` with parenthetical purpose. Skip trivial stores.

3. **Key composables** — list composables that are entry points or widely used across features. Skip internal/helper composables.

4. **Layouts** — list all files in `app/layouts/` with format name.

5. **Pages** — group by top-level route (`admin/`, `donor/`, `portal/`) with 1-line description each.

#### How to gather

1. `ls app/features/` — list all feature directories
2. For each feature: check for `stores/`, `composables/`, `shared/types.ts`, and count sub-features if nested
3. `ls app/layouts/` — list layouts
4. `ls -R app/pages/` — map page routes

#### Rules

- Be CONCISE. No prose. No filler words. Table + bullet lists only.
- Preserve the HTML comment markers exactly.
- Do not add explanations of architecture (that's in the Architecture section).
- Do not duplicate information already in `.claude/rules/` path-scoped files.
- If a feature is new, add it. If a feature was removed, delete it. If key files changed, update the paths.

## Part 2: Audit `.claude/rules/` files

After updating the project summary, audit each `.claude/rules/*.md` file against the current codebase. These are path-scoped context files that help future sessions understand specific areas quickly.

### For each existing rules file

1. **Verify key files still exist** — check that every path listed under "Key files" is still valid. Remove stale entries, add new important files.
2. **Verify counts and lists** — sub-feature counts, field type counts, component lists. Update if changed.
3. **Verify patterns** — confirm documented patterns still match actual code. Update if conventions shifted.
4. **Keep it short** — rules files should be scannable in 10 seconds. Cut anything that's obvious from reading the code itself.

### When to create a new rules file

Create a new `.claude/rules/<feature>.md` if ALL of these are true:

- A feature directory under `app/features/` has no corresponding rules file
- The feature has meaningful complexity (3+ key files, non-obvious patterns, or gotchas)
- The rules would save a future session real investigation time

Do NOT create rules files for simple features where the code is self-documenting.

### Rules file format

```markdown
---
paths:
  - 'app/features/<feature>/**'
  - 'app/pages/<related-pages>/**' # if applicable
---

# Feature Name

One-line purpose.

## Key files

- **Role:** `relative/path.ts` — what it does (one line)

## Patterns

- Bullet points of non-obvious conventions, gotchas, or architectural decisions
```

### Rules for rules

- NEVER duplicate CLAUDE.md content (architecture, code standards, commandments)
- NEVER document obvious things (file naming, import conventions)
- DO document: key file roles, non-obvious patterns, gotchas, current limitations
- Keep each file under 40 lines of content (excluding frontmatter)
- If a feature was removed, delete its rules file
