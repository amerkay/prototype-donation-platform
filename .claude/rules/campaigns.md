---
paths:
  - 'app/features/campaigns/**'
  - 'app/pages/admin/campaigns/**'
  - 'app/pages/admin/p2p/**'
  - 'app/pages/[org_slug]/**'
---

# Campaigns Feature

Campaign CRUD with sub-features extracted into `features/` directories.

## Key files

- **Composables:** `shared/composables/useCampaigns.ts` (CRUD), `useForm.ts` (single form ops), `useCampaignTypes.ts` (`getCampaignEditPath`), `useCampaignFormatters.ts`
- **Store:** `shared/stores/campaignConfig.ts` (snapshot, NOT reactive to useCampaigns)
- **Capabilities:** `shared/utils/campaignCapabilities.ts` — `getCampaignCapabilities(type)`, `getFormType(type)`
- **Types:** `shared/types.ts` — `CampaignType`, `CampaignStatus`, `FundraiserStatus`

## Sub-features (in `features/`)

- **crowdfunding/** — goal + progress bar, `CrowdfundingPage.vue` (preview + live), donor components
- **matched-giving/** — match periods, `MatchPeriodsList.vue` (componentField), `useMatchedGiving.ts`
- **p2p/** — fundraiser pages, templates, onboarding wizard, `useFundraisers.ts`, `fundraiserColumns.ts`
- **sharing/** — social share dialog, `useCampaignShare.ts`

## Patterns

- **Campaign types**: `standard`, `p2p`, `p2p-fundraiser`, `event` — capabilities determined by `getCampaignCapabilities()`
- **Form types**: campaigns use either `donation` or `registration` forms via `getFormType(campaignType)`
- **Status model**: Campaigns: `draft|active|completed|ended`. P2P templates: `draft|active`. Fundraisers: `active|completed|ended`.
- **Crowdfunding page**: `features/crowdfunding/donor/components/CrowdfundingPage.vue` — both admin preview and live
- **configStore snapshot**: `campaignConfig.fundraisers` initialized once; always sync after `updateCampaign()` when `configStore.id === campaign.id`
