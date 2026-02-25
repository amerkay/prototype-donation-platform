---
paths:
  - 'app/features/subscriptions/**'
  - 'app/pages/admin/subscriptions/**'
  - 'app/pages/portal/subscriptions/**'
---

# Subscriptions Feature

Recurring donation management across admin and donor portal.

## Key files

- **Admin:** `admin/composables/useAdminSubscriptions.ts`, `admin/columns/subscriptionColumns.ts`, `admin/composables/useSubscriptionFilters.ts`
- **Shared:** `shared/composables/useSubscriptionActions.ts` (pause/resume/cancel/change-amount), `shared/components/SubscriptionActionDialogs.vue`
- **Donor:** `donor/components/SubscriptionCard.vue` — read-only summary, links to portal detail

## Patterns

- **Shared actions**: `useSubscriptionActions` + `SubscriptionActionDialogs` reused by both admin and portal detail pages
- **Portal gating**: Portal wraps actions with `useActionEligibility` from donor-portal; admin skips eligibility
- **SubscriptionCard is read-only**: Actions live on portal detail page (`portal/subscriptions/[id].vue`)
