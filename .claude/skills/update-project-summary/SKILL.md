---
description: Regenerate the Project Summary section in CLAUDE.md and audit .claude/rules/ files
---

## Part 0: Review Recent Changes

Before updating anything, run `git log -5` to read the last 5 commits with full messages. Use this context to:

1. **Update Continuous Learning** — if any commit introduced a durable, reusable insight (non-obvious pattern, gotcha, architectural decision), add or merge it into the `<!-- continuous learning notes -->` section of `CLAUDE.md`. Follow existing bullet style (1 line, ~100 chars). Never duplicate — merge with existing bullets when related.
2. **Inform Parts 1 & 2** — use commit history to spot new features, removed features, renamed files, or shifted patterns that the project summary and rules files should reflect.

## Parts 1 & 2: Parallel Execution

After Part 0, launch **two agents in parallel** (single message, two Task tool calls):

### Agent 1: Update Project Summary (`subagent_type: "general-purpose"`)

Prompt the agent to update ONLY the `## Project Summary` section in `CLAUDE.md` — the content between the `<!-- regenerate with /update-project-summary -->` and `<!-- end project summary -->` markers. Do NOT modify any other section. Include the full instructions below in the agent prompt.

**What to capture** — the summary exists so future sessions understand the system without exploring the entire codebase. Every line must earn its place.

Required sections:

1. **Feature table** — one row per directory under `app/features/`. Columns: Feature, Path, Purpose (1 line max). Include sub-feature counts where relevant.
2. **Key stores** — list ONLY stores that hold significant state. Format: `relative/path/to/store.ts` with parenthetical purpose. Skip trivial stores.
3. **Key composables** — list composables that are entry points or widely used across features. Skip internal/helper composables.
4. **Layouts** — list all files in `app/layouts/` with format name.
5. **Pages** — group by top-level route (`admin/`, `donor/`, `portal/`) with 1-line description each.

How to gather: `ls app/features/`, check each for `stores/`, `composables/`, sub-features; `ls app/layouts/`; `ls -R app/pages/`.

Rules: Be CONCISE — table + bullet lists only. Preserve HTML comment markers. No architecture explanations. Don't duplicate `.claude/rules/` content. Add new features, remove deleted ones, update changed paths.

### Agent 2: Audit `.claude/rules/` files (`subagent_type: "general-purpose"`)

Prompt the agent to audit all `.claude/rules/*.md` files against the current codebase. Include the full instructions below in the agent prompt.

**For each existing rules file:**

1. **Verify referenced files still exist** — remove stale paths, add new important files.
2. **Verify counts and lists** — sub-feature counts, field type counts, component lists.
3. **Verify procedures** — confirm documented steps still match actual code patterns.
4. **Keep it short** — scannable in 10 seconds. Cut anything obvious from reading code.

**Check for missing rules files:** Every feature directory under `app/features/` must be checked for a corresponding `.claude/rules/<feature>.md`. Create one if ALL true:

- No corresponding rules file exists
- Feature has meaningful complexity (3+ key files, non-obvious patterns, or gotchas)
- Rules would save a future session real investigation time

Do NOT create rules files for simple, self-documenting features.

**Rules file format — procedural style:**

```markdown
---
paths:
  - 'app/features/<feature>/**'
  - 'app/pages/<related-pages>/**' # if applicable
---

# Feature Name

## To [common task in this feature]

1. Start by [first step] — `relative/path.ts`
2. Then [second step]
3. [Third step if needed]

## To [another common task]

1. [Step with file reference]
2. [Step with constraint or gotcha]
```

Structure rules as "To [do X]" procedures with numbered steps. File paths appear in context of the steps, not as standalone listings. Hard constraints (import rules, sacred rules) go at the top as bold declarations.

**Rules for rules:** NEVER duplicate CLAUDE.md content. NEVER document obvious things. DO document procedures, constraints, and gotchas. Keep each file under 40 lines of content (excluding frontmatter). If a feature was removed, delete its rules file. Always create in `.claude/rules/` — never elsewhere.
