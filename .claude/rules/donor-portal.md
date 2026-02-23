---
paths:
  - 'app/features/donor-portal/**'
  - 'app/pages/portal/**'
---

# Donor Portal Feature

Donor-facing dashboard for viewing donation history, managing subscriptions, and tracking fundraisers.

## Key files

- **Main composable:** `composables/useDonorPortal.ts` — provides transactions, subscriptions, fundraisers, computed stats
- **Eligibility:** `composables/useActionEligibility.ts` — gates pause/cancel/refund based on org settings (duration, donor value)
- **Types:** `types.ts` — Transaction, PaymentMethod, TransactionLineItem, GiftAidDeclaration, ConsentRecord
- **DataTable:** `components/DataTable.vue` — TanStack Vue Table wrapper with sorting + pagination
- **Columns:** `columns/transactionColumns.ts`, `columns/fundraiserDonationColumns.ts`
- **Detail cards:** `components/PortalDonorCard.vue` (simple donor display, no stats/link), `components/PortalLineItemsCard.vue` (portal-owned line items table)
- **Sidebar:** `sidebar/PortalSidebar.vue`

## Pages (in `app/pages/portal/`)

- `index.vue` — Dashboard with stat cards, recent transactions, subscriptions, fundraisers
- `donations/index.vue` — Full transaction history table
- `donations/[id].vue` — Transaction detail with eligibility-gated refund
- `subscriptions/index.vue` — Card-based subscription list (read-only cards link to detail)
- `subscriptions/[id].vue` — Subscription detail with eligibility-gated actions (pause/resume/cancel/change amount)
- `fundraisers/index.vue` — User's fundraiser list
- `fundraisers/[id].vue` — Fundraiser detail with donation table
- `fundraisers/[id]/edit.vue` — Fundraiser editor
- `my-data.vue` — GDPR: donor data export, Gift Aid declarations, consent records

## Patterns

- **Shared action composables**: `useRefundAction` (in `donations/shared/`) and `useSubscriptionActions` + `SubscriptionActionDialogs` (in `subscriptions/shared/`) are reused by both portal and admin pages
- **Portal wraps with eligibility**: Portal pages gate actions via `useActionEligibility`; admin pages use the same composables without eligibility checks
- Uses sample data from `app/sample-api-responses/`, no real auth
- Layout: `portal.vue`
