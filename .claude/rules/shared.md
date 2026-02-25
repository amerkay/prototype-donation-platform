---
paths:
  - 'app/features/_shared/**'
---

# Shared Infrastructure (`_shared/`)

Cross-boundary code used by **both** admin and portal. 80%+ rule: if mostly one side, keep it there.

## Key files

- **Components:** `BreadcrumbBar.vue`, `DataTable.vue` (TanStack Vue Table), `EditLayout.vue` (two-column + discard/leave dialogs)
- **Composables:** `useEditState.ts` (save/discard/dirty/nav guard — exports `EditableStore`, `DeleteProtection`), `useEntityDataService.ts` (cross-entity lookups)
- **Utils:** `column-builders.ts` (supports `meta.thClass` for `<th>` styling), `actionColumn.ts`, `buildCustomFieldSchema.ts`, `buildCrossEntityEvaluators.ts`

## Rules

- **Naming:** Drop "Admin" prefix for shared components (e.g., `EditLayout` not `AdminEditLayout`)
- **Imports flow inward:** `_admin/` and `donor-portal/` may import from `_shared/`, but `_shared/` must NEVER import from feature folders (except `_library/`)
