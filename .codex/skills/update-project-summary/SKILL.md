---
name: update-project-summary
description: Update AGENTS.md only when structure changes or a crucial durable learning must be retained; otherwise no-op.
metadata:
  short-description: Conditionally refresh AGENTS.md summary + compact learnings
---

# update-project-summary

Keeps `AGENTS.md` accurate without bloat. Run only when AGENTS rule #17 gates pass.

## Use only when

- Project structure changed, OR
- A crucial, reusable learning is worth retaining.

## Goal

- Keep `## Project Summary` correct (when structure changes).
- Keep `## Continuous Learning (Compact)` limited to critical durable lessons.
- Keep `## Commands`, `## Architecture`, `## Code Standards` aligned with real repo behavior.

## Inputs

- Current working tree + git changes
- Current `AGENTS.md`

## Allowed edits (strict)

Only these sections:

- `## Commands`
- `## Architecture`
- `## Code Standards`
  And only within markers:
- `<!-- project summary --> ... <!-- end project summary -->`
- `<!-- continuous learning notes --> ... <!-- end continuous learning notes -->`

## Workflow

1. Detect structure-impacting changes from paths.
2. Detect crucial learnings (durable, broadly reusable, expensive to relearn).
3. Choose scope: `no_changes | docs_only | learning_only | summary_and_docs | structure_and_learning | full_allowed_scope`.
4. Apply minimal local edits only in allowed areas.
5. Enforce learning limits.

## Structure signals

Treat as structure-impacting when add/remove/rename/move or materially change:

- `app/features/**`
- `**/stores/*.ts`
- `**/composables/*.ts`
- `app/layouts/*.vue`
- `app/pages/**/*.vue`

## Update rules

- Minimal edits; modify existing bullets/rows before adding.
- No speculative rules; encode only validated patterns.
- Avoid rewrites if only one item changed.

## Continuous learning rules

- Only crucial, durable implementation lessons.
- Max 6 bullets, 1 line each, ≤110 chars.
- Deduplicate/merge first; prune low-value/stale notes when full.
- Reject trivial/task-specific notes (timestamps, branches, one-off fixes).

## Output contract

- State: `no-op` / `learning updated` / `project summary updated`.
- If structure summary changed, include exactly:
  **Project structure changed — run /update-project-summary to keep CLAUDE.md current.**

## Guardrails

- Keep edits minimal and local.
- Never create `memory.md`.
- Never store secrets.
