---
paths:
  - 'app/features/_admin/**'
---

# Admin Infrastructure

## To add a CRUD entity (campaigns, products, certificates, emails)

1. Create a singleton composable using `useSessionStorageSingleton` for the list data
2. Build the card listing with `AdminCardGrid` + `AdminEntityCard` (slots: `#image`, `#badges`, `#stats`, `#actions`)
3. Create a Pinia edit store using `useEditableState()` from `composables/defineEditableStore.ts`
4. Build the edit page with `EditLayout` + `useEditState` from `_shared/`
5. Add config form using `AdminConfigPanel` + `FormRenderer` + `StickyButtonGroup`
6. Implement delete protection via `getDeleteProtection()`
7. For dirty detection: `useEditState` reads `originalData` from `store.toSnapshot()`, NOT the composable

## To add a settings page

1. Define the store using `defineSettingsStore` from `composables/defineSettingsStore.ts`
2. Use `StickyButtonGroup` for save/discard — all settings pages MUST use this

## To add an admin list page (donations, donors, subscriptions)

1. Use `AdminListPage` + `DataTable` + `AdminFilterSheet`
2. For cross-entity filtering: wire up `useEntityDataService` from `_shared/` + `buildCustomFieldSchema` + `withCustomFieldEvaluators`

## To add admin detail cards

Reuse existing card components: `DonorInfoCard` (stats via `useDonorStats`), `LineItemsCard`, `CustomFieldsCard`, `TransactionHistoryCard`.
