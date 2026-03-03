---
paths:
  - 'app/features/donor-portal/**'
  - 'app/pages/portal/**'
---

# Donor Portal Feature

## To add a new portal page or section

1. Main data comes from `composables/useDonorPortal.ts` — provides transactions, subscriptions, fundraisers, and computed stats
2. Use portal-specific detail components: `PortalDetailRow`, `PortalDonorCard` (no stats/link), `PortalLineItemsCard`
3. Types in `types.ts`: `Transaction`, `PaymentMethod`, `TransactionLineItem`, `GiftAidDeclaration`, `ConsentRecord`

## To add a portal action (refund, pause, cancel, etc.)

1. Reuse shared action composables — do NOT duplicate logic:
   - Refunds: `useRefundAction` from `donations/shared/`
   - Subscription actions: `useSubscriptionActions` + `SubscriptionActionDialogs` from `subscriptions/shared/`
2. Gate the action with eligibility: wrap calls using `useActionEligibility` from `composables/useActionEligibility.ts`
   - This gates pause/cancel/refund based on org settings (duration, donor value)
3. Admin pages use the same shared composables but skip eligibility checks — the portal is the only place that enforces eligibility
