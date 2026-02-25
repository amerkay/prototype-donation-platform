---
paths:
  - 'app/features/_admin/**'
---

# Admin Infrastructure

Admin-specific UI components and patterns. Cross-boundary shared code lives in `_shared/`.

## Key files

- **Store helpers:** `composables/defineSettingsStore.ts` (settings factory), `composables/defineEditableStore.ts` (`useEditableState()`)
- **List page:** `components/AdminListPage.vue` (breadcrumbs + header + table + filters)
- **Card components:** `AdminEntityCard.vue` (#image/#badges/#stats/#actions), `AdminEntityCardPlaceholder.vue`, `AdminCardGrid.vue`
- **Detail cards:** `DonorInfoCard.vue` (stats via `useDonorStats`), `LineItemsCard.vue`, `CustomFieldsCard.vue`, `TransactionHistoryCard.vue`
- **Sticky actions:** `components/StickyButtonGroup.vue` — all save/discard MUST use this

## Cross-entity filtering

`_shared/composables/useEntityDataService` provides lookup maps. Filter composables use `_shared/utils/buildCustomFieldSchema` + `withCustomFieldEvaluators` for JSONB custom field conditions.
