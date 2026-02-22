---
paths:
  - 'app/features/donor-portal/**'
  - 'app/pages/portal/**'
---

# Donor Portal Feature

Donor-facing dashboard for viewing donation history, managing subscriptions, and tracking fundraisers.

## Key files

- **Main composable:** `composables/useDonorPortal.ts` — provides transactions, subscriptions, fundraisers, computed stats
- **Types:** `types.ts` — Transaction, Subscription, PaymentMethod, TransactionLineItem, status enums
- **DataTable:** `components/DataTable.vue` — TanStack Vue Table wrapper with sorting + pagination
- **Columns:** `columns/transactionColumns.ts`, `columns/fundraiserDonationColumns.ts`
- **Sidebar:** `sidebar/PortalSidebar.vue`

## Pages (in `app/pages/portal/`)

- `index.vue` — Dashboard with stat cards, recent transactions, subscriptions, fundraisers
- `donations.vue` — Full transaction history table
- `subscriptions.vue` — Card-based subscription management
- `fundraisers/index.vue` — User's fundraiser list
- `fundraisers/[id].vue` — Fundraiser detail with donation table
- `fundraisers/[id]/edit.vue` — Fundraiser editor
- `my-data.vue` — GDPR: donor data export, Gift Aid declarations, consent records

## Current state

- Uses sample data from `app/sample-api-responses/`
- Subscription actions (pause, resume, cancel) are disabled/placeholder
- No real auth — hardcoded demo user email
- Layout: `portal.vue`
