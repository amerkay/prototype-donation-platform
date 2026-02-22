---
paths:
  - 'app/features/_admin/**'
---

# Admin Infrastructure

Shared admin UI components, composables, and patterns used across all admin pages.

## Key files

- **Edit infrastructure:** `composables/useAdminEdit.ts` — smart dirty detection, save/discard handlers, delete protection interface
- **Store helpers:** `composables/defineSettingsStore.ts` (simple settings factory), `composables/defineEditableStore.ts` exports `useEditableState()` (isDirty/isSaving state)
- **Data service:** `composables/useEntityDataService.ts` — singleton lookup maps (donorById, transactionsByDonorId, etc.) for cross-entity filtering
- **Layouts:** `components/AdminEditLayout.vue` (header + preview), `components/AdminListPage.vue` (breadcrumbs + header + table + filters)
- **Card components:** `components/AdminEntityCard.vue` (slot-based: #image/#badges/#stats/#actions), `AdminEntityCardPlaceholder.vue`, `AdminCardGrid.vue`
- **Sidebar:** `components/AdminSidebar.vue` + `composables/useActiveLink.ts`
- **Sticky actions:** `components/StickyButtonGroup.vue` — all save/discard buttons MUST use this (never custom button bars)

## CRUD pattern (campaigns, products, certificates, emails)

1. Singleton composable (`useSessionStorageSingleton` or manual) provides data + CRUD methods
2. Card listing (`AdminCardGrid` + `*Card.vue` wrapping `AdminEntityCard`) with StatusBadge + AdminDeleteButton
3. Pinia edit store (`useEditableState`) manages dirty state
4. Edit page (`[id].vue`) uses `AdminEditLayout` + `useAdminEdit`
5. Config form uses `AdminConfigPanel` wrapping FormRenderer + StickyButtonGroup

**Delete protection:** Each composable exposes `getDeleteProtection(id): DeleteProtection` — both cards and headers call it for consistent disabled state.

**Smart dirty detection:** `useAdminEdit` patches `store.markDirty()` with deep comparison so `isDirty` auto-clears when values return to saved state. Requires `originalData` from `store.toSnapshot()`, NOT from composable (composable data doesn't change on edit).

## Admin list pattern (donations, donors, subscriptions)

`AdminListPage` wraps breadcrumbs, page header (date range picker + filter button + quick find + export), `AdminDataTable`, `AdminFilterSheet` with FormRenderer. Each page provides columns, data, filter composable, export mapper via `#export-menu` slot.

**Cross-entity filtering:** `useEntityDataService` provides lookup maps. Filter composables use `buildCustomFieldSchema` + `withCustomFieldEvaluators` for JSONB custom field conditions.
