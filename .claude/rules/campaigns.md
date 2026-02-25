---
paths:
  - 'app/features/campaigns/**'
  - 'app/pages/admin/campaigns/**'
  - 'app/pages/admin/p2p/**'
  - 'app/pages/[org_slug]/**'
---

# Campaigns Feature

Campaign CRUD with standard, crowdfunding, and P2P fundraising types.

## Key files

- **Composables:** `shared/composables/useCampaigns.ts` (CRUD), `useForms.ts`, `useCampaignTypes.ts` (`getCampaignEditPath`), `useCampaignShare.ts`, `useCampaignFormatters.ts`
- **P2P:** `admin/composables/useFundraisers.ts`, `useFundraiserFilters.ts`
- **Stores:** `shared/stores/campaignConfig.ts` (snapshot, NOT reactive to useCampaigns), `shared/stores/forms.ts`
- **Types:** `shared/types.ts` — `CampaignStatus`, `FundraiserStatus`
- **Columns:** `admin/columns/fundraiserColumns.ts` — shared for embedded + standalone list

## Patterns

- **Campaign types**: `standard` (basic), `crowdfunding` (goal + progress), `p2p` (fundraiser pages with templates)
- **Status model**: Campaigns: `draft|active|completed|ended`. P2P templates: `draft|active` only. Fundraisers: `active|completed|ended` only.
- **Crowdfunding page**: `donor/components/CrowdfundingPage.vue` serves as both preview and live — admin renders real component
- **P2P onboarding**: wizard at `[org_slug]/p2p-onboard/[campaignId]` creates fundraiser pages from templates
- **configStore snapshot**: `campaignConfig.fundraisers` initialized once; always sync after `updateCampaign()` when `configStore.id === campaign.id`
