---
paths:
  - 'app/features/campaigns/**'
  - 'app/pages/admin/campaigns/**'
  - 'app/pages/admin/p2p/**'
  - 'app/pages/[org_slug]/**'
---

# Campaigns Feature

## To modify campaign capabilities or add a campaign type

1. Edit `shared/utils/campaignCapabilities.ts` — single source of truth for `getCampaignCapabilities(type)` (15 flags) and `getFormType(type)`
2. Current types: `standard`, `p2p`, `p2p-fundraiser`, `event`
3. Form types: campaigns use either `donation` or `registration` forms — determined by `getFormType(campaignType)`

## To work with campaign data

1. List/CRUD operations: use `shared/composables/useCampaigns.ts`
2. Edit store: use `shared/stores/campaignConfig.ts` — this is a snapshot, NOT reactive to `useCampaigns`
3. After calling `updateCampaign()`, always sync `configStore.fundraisers` when `configStore.id === campaign.id`
4. For campaign routing: use `getCampaignEditPath` from `useCampaignTypes.ts`
5. For display formatting: use `useCampaignFormatters.ts`

## To work with sub-features

Sub-features live in `features/` subdirectories. Each follows the standard admin/donor split:

- **crowdfunding/** — goal + progress bar, `CrowdfundingPage.vue` (donor view) + `CrowdfundingPagePreview.vue` (admin preview)
- **matched-giving/** — match periods via `MatchPeriodsList.vue` (a `componentField`), `useMatchedGiving.ts` (provide/inject for donor-side)
- **p2p/** — fundraiser pages, templates, onboarding wizard, `useFundraisers.ts`, `fundraiserColumns.ts`
- **sharing/** — social share dialog via `useCampaignShare.ts`

## Status model

- Campaigns: `draft` → `active` → `completed` | `ended`
- P2P templates: `draft` → `active`
- Fundraisers: `active` → `completed` | `ended`

Types in `shared/types.ts`: `CampaignType`, `CampaignStatus`, `FundraiserStatus`.
