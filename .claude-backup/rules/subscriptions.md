---
paths:
  - 'app/features/subscriptions/**'
  - 'app/pages/admin/subscriptions/**'
  - 'app/pages/portal/subscriptions/**'
---

# Subscriptions Feature

Recurring donation management across admin and donor portal.

## Key files

- **Admin:** `admin/composables/useAdminSubscriptions.ts` (list + lookup), `admin/columns/subscriptionColumns.ts`, `admin/composables/useSubscriptionFilters.ts`
- **Shared:** `shared/composables/useSubscriptionActions.ts` (pause/resume/cancel/change-amount logic), `shared/components/SubscriptionActionDialogs.vue` (dialog UI for all actions), `shared/types.ts`
- **Donor:** `donor/components/SubscriptionCard.vue` — read-only summary card, links to portal detail page

## Patterns

- **Shared actions**: `useSubscriptionActions` + `SubscriptionActionDialogs` are reused by both admin `subscriptions/[id].vue` and portal `subscriptions/[id].vue`
- **Portal gating**: Portal pages wrap actions with `useActionEligibility` from donor-portal feature; admin pages skip eligibility
- **SubscriptionCard is read-only**: Actions were moved to portal detail page (`portal/subscriptions/[id].vue`); card just links there
- **Detail cards**: Admin uses `DonorInfoCard`/`LineItemsCard` from `_admin/`; portal uses `PortalDonorCard`/`PortalLineItemsCard` from `donor-portal/`
