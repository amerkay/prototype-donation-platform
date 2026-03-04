---
description: Audit the codebase for single-source-of-truth violations — derived/computed data duplicated across files instead of centralized in composables. Use when reviewing code quality or after large refactors.
argument-hint: "[feature-name or blank for full scan]"
disable-model-invocation: true
---

# Single Source of Truth Audit

Detect derived/computed data duplicated across files instead of being centralized in a composable.

**Scope:** If `$ARGUMENTS` names a feature, restrict to that feature. Otherwise, audit the full `app/` tree.

## Phase 1: Parallel Inventory (3 agents)

Launch **three Explore agents in parallel** (single message, three Agent tool calls). Each extracts all `computed()` bodies, `.reduce()` / `.filter()` aggregations, and derived-data functions.

Output format per item: `file:line | name | 1-line summary | key domain fields read`

### Agent 1 — Sources

Search `app/features/**/composables/*.ts` and `app/features/**/stores/*.ts`. Extract every exported computed/function that derives data. Note key fields it reads (e.g. `totalAmount`, `exchangeRate`).

### Agent 2 — Pages

Search `app/pages/**/*.vue`. Extract every `computed()` doing filtering, aggregation, or derivation. Note which composable imports are already present (to detect "available but unused").

### Agent 3 — Components

Search `app/features/**/components/**/*.vue` (exclude `app/components/ui/`). Same extraction as Agent 2.

## Phase 2: Cross-Reference

After all three agents return, launch **one general-purpose agent** with the combined inventories. Detect violations:

1. **Duplicated computation**: Same logical formula (same fields, same intent) in 2+ consumer files — even with different variable names. Example: `t.totalAmount * t.exchangeRate` summed with a date filter appearing in 3 pages.

2. **Composable bypass**: A page/component derives something inline that a composable already exports or could trivially export.

3. **Store re-derivation**: A component re-derives a value the store already exposes as a computed.

Ignore simple one-field accesses, UI-only transforms, and template-local booleans.

### Report format

For each violation:

```
## [short description]
**What:** [1-line formula description]
**Where:** file1:line, file2:line
**Fix:** [which composable should own this]
**Severity:** High | Medium | Low
```

End with: total count, severity breakdown, top 3 immediate actions.
