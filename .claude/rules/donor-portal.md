---
paths:
  - 'app/features/donor-portal/**'
  - 'app/pages/portal/**'
---

# Donor Portal Feature

Donor-facing dashboard for viewing donation history, managing subscriptions, and tracking fundraisers.

## Key files

- **Main composable:** `composables/useDonorPortal.ts` — transactions, subscriptions, fundraisers, computed stats
- **Eligibility:** `composables/useActionEligibility.ts` — gates pause/cancel/refund based on org settings (duration, donor value)
- **Types:** `types.ts` — Transaction, PaymentMethod, TransactionLineItem, GiftAidDeclaration, ConsentRecord
- **Detail components:** `PortalDetailRow.vue`, `PortalDonorCard.vue` (no stats/link), `PortalLineItemsCard.vue`

## Patterns

- **Shared action composables**: `useRefundAction` (in `donations/shared/`) and `useSubscriptionActions` + `SubscriptionActionDialogs` (in `subscriptions/shared/`) reused by both portal and admin
- **Portal wraps with eligibility**: Portal pages gate actions via `useActionEligibility`; admin pages use same composables without eligibility checks
