---
paths:
  - 'app/features/_shared/**'
---

# Shared Infrastructure (`_shared/`)

**Import rule**: `_admin/` and `donor-portal/` may import from `_shared/`, but `_shared/` must NEVER import from feature folders (except `_library/`).

**80% rule**: Only put code here if BOTH admin and portal import it. If mostly one side, keep it there.

## To add a shared component

1. Drop the "Admin" prefix (e.g., `EditLayout` not `AdminEditLayout`)
2. Existing shared components: `BreadcrumbBar`, `DataTable` (TanStack Vue Table), `EditLayout` (two-column + discard/leave dialogs)

## To build an edit page

1. Use `EditLayout` for the two-column layout with built-in discard/leave dialogs
2. Wire up save/discard/dirty/nav guard via `useEditState` (exports `EditableStore`, `DeleteProtection`)

## To use cross-entity data in filters or lookups

1. Use `useEntityDataService` for cross-entity lookup maps
2. Build filter schemas with `buildCustomFieldSchema` + `buildCrossEntityEvaluators`
3. For table columns: use `column-builders.ts` (supports `meta.thClass` for `<th>` styling) and `actionColumn.ts`
