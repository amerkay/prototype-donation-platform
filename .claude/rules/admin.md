---
paths:
  - 'app/features/_admin/**'
---

# Admin Infrastructure

Admin-specific UI components, composables, and patterns used across admin pages. Cross-boundary shared code (used by both admin + portal) lives in `_shared/`.

## Key files

- **Store helpers:** `composables/defineSettingsStore.ts` (simple settings factory), `composables/defineEditableStore.ts` exports `useEditableState()` (isDirty/isSaving state)
- **Layouts:** `components/AdminListPage.vue` (breadcrumbs + header + table + filters)
- **Card components:** `components/AdminEntityCard.vue` (slot-based: #image/#badges/#stats/#actions), `AdminEntityCardPlaceholder.vue`, `AdminCardGrid.vue`
- **Detail cards:** `DonorInfoCard.vue` (donor info + stats via `useDonorStats`), `LineItemsCard.vue` (order details + campaign link), `CustomFieldsCard.vue`, `TransactionHistoryCard.vue` — admin-only (portal has its own `PortalDonorCard`/`PortalLineItemsCard`)
- **Donor stats:** `composables/useDonorStats.ts` — shared donor metrics (totalDonated, donationCount, avgDonation, activeSubscriptions, monthlyRecurring) from `_shared/useEntityDataService`
- **Sidebar:** `sidebar/AppSidebar.vue` + `composables/useActiveLink.ts`
- **Sticky actions:** `components/StickyButtonGroup.vue` — all save/discard buttons MUST use this (never custom button bars)

## CRUD pattern (campaigns, products, certificates, emails)

1. Singleton composable (`useSessionStorageSingleton` or manual) provides data + CRUD methods
2. Card listing (`AdminCardGrid` + `*Card.vue` wrapping `AdminEntityCard`) with StatusBadge + AdminDeleteButton
3. Pinia edit store (`useEditableState`) manages dirty state
4. Edit page (`[id].vue`) uses `EditLayout` (from `_shared/`) + `useEditState` (from `_shared/`)
5. Config form uses `AdminConfigPanel` wrapping FormRenderer + StickyButtonGroup

**Delete protection:** Each composable exposes `getDeleteProtection(id): DeleteProtection` (interface in `_shared/composables/useEditState.ts`) — both cards and headers call it for consistent disabled state.

**Smart dirty detection:** `useEditState` patches `store.markDirty()` with deep comparison so `isDirty` auto-clears when values return to saved state. Requires `originalData` from `store.toSnapshot()`, NOT from composable (composable data doesn't change on edit).

## Admin list pattern (donations, donors, subscriptions)

`AdminListPage` wraps breadcrumbs, page header (date range picker + filter button + quick find + export), `AdminDataTable`, `AdminFilterSheet` with FormRenderer. Each page provides columns, data, filter composable, export mapper via `#export-menu` slot.

**Cross-entity filtering:** `_shared/composables/useEntityDataService` provides lookup maps. Filter composables use `_shared/utils/buildCustomFieldSchema` + `withCustomFieldEvaluators` for JSONB custom field conditions.
