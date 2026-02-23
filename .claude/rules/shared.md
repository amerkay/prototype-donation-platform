---
paths:
  - 'app/features/_shared/**'
---

# Shared Infrastructure (`_shared/`)

Cross-boundary code used by **both** admin and portal pages. Only move files here when genuinely used by both sides (80%+ rule applies inversely — if mostly one side, keep it there).

## Key files

- **Components:** `BreadcrumbBar.vue` (breadcrumb + sidebar trigger), `EditLayout.vue` (breadcrumb + content/preview two-column + discard/leave dialogs)
- **Composables:** `useEditState.ts` (save/discard/dirty detection/navigation guard — exports `EditableStore`, `DeleteProtection`, `LEAVE_GUARD_KEY`), `useEntityDataService.ts` (singleton cross-entity lookup maps)
- **Sidebar:** `NavUser.vue` (user dropdown with theme toggle)
- **Utils:** `column-builders.ts` (TanStack table column factories), `buildCustomFieldSchema.ts` + `buildCrossEntityEvaluators.ts` (dynamic filter infrastructure), `shared-filter-schemas.ts` (reusable filter field definitions)

## Rules

- **No domain logic:** `_shared/` must stay domain-agnostic like `_library/`. No donation/campaign/subscription-specific code.
- **Naming:** Drop the "Admin" prefix for shared components (e.g., `EditLayout` not `AdminEditLayout`).
- **Imports flow inward:** `_admin/` and `donor-portal/` may import from `_shared/`, but `_shared/` must NEVER import from feature folders (except `_library/`).
