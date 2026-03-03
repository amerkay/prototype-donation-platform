---
paths:
  - 'app/features/subscriptions/**'
  - 'app/pages/admin/subscriptions/**'
  - 'app/pages/portal/subscriptions/**'
---

# Subscriptions Feature

## To add a subscription action (pause, resume, cancel, change amount)

1. Add the action logic to `shared/composables/useSubscriptionActions.ts` — this is reused by both admin and portal
2. Add any confirmation UI to `shared/components/SubscriptionActionDialogs.vue`
3. Portal pages gate actions via `useActionEligibility` from `donor-portal/`; admin pages use the same composables without eligibility checks

## To work with admin subscription list

1. Data: `admin/composables/useAdminSubscriptions.ts`
2. Columns: `admin/columns/subscriptionColumns.ts`
3. Filters: `admin/composables/useSubscriptionFilters.ts`

## To work with donor-side subscription display

`donor/components/SubscriptionCard.vue` is read-only — it shows a summary and links to the portal detail page. Actions live on the portal detail page (`portal/subscriptions/[id].vue`), not on the card.
