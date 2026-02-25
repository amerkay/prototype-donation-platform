---
paths:
  - 'app/features/campaigns/**'
  - 'app/pages/admin/campaigns/**'
  - 'app/pages/admin/p2p/**'
  - 'app/pages/[org_slug]/**'
---

# Campaigns Feature

Campaign CRUD with standard, crowdfunding, and P2P fundraising types. Each campaign has forms (donation wizards).

## Key files

- **Composables:** `shared/composables/useCampaigns.ts` (CRUD), `useForms.ts` (campaign forms), `useCampaignTypes.ts` (type metadata + `getCampaignEditPath`), `useCampaignShare.ts` (sharing), `useCampaignFormatters.ts` (currency/amount formatting)
- **P2P composables:** `admin/composables/useFundraisers.ts` (allFundraisers, stats, status actions), `admin/composables/useFundraiserFilters.ts` (filter schema for list page)
- **Stores:** `shared/stores/campaignConfig.ts` (campaign edit state — snapshot, NOT reactive to useCampaigns), `shared/stores/forms.ts` (form edit state)
- **Types:** `shared/types.ts` — `CampaignStatus: draft|active|completed|ended`, `FundraiserStatus: active|completed|ended`
- **Admin forms:** `admin/forms/campaign-config-master.ts` (defineForm), `crowdfunding-settings-form.ts`, `p2p-settings-form.ts`, `donation-forms-form.ts`
- **P2P templates:** `admin/templates/` — birthday, challenge, custom, tribute, wedding presets
- **Columns:** `admin/columns/fundraiserColumns.ts` — shared column defs for both embedded list and standalone list page

## Patterns

- **Campaign types**: `standard` (basic), `crowdfunding` (goal + progress), `p2p` (fundraiser pages with templates)
- **Status model**: Standard campaigns use all 4 statuses. P2P templates: `draft`/`active` only (no archive, no terminal). Fundraisers: `active`/`completed`/`ended` only. Subscription `paused` is a separate domain — do not conflate.
- **Forms are children of campaigns**: each campaign has N forms, each form links to a donation-form config
- **Crowdfunding page**: `donor/components/CrowdfundingPage.vue` is both preview and live; admin preview renders real component
- **P2P onboarding**: wizard at `[org_slug]/p2p-onboard/[campaignId]` creates fundraiser pages from templates
- **Admin routing**: Standard campaigns → `/admin/campaigns/` list + `/admin/campaigns/[id]` edit. P2P templates → `/admin/p2p/templates/` (redirect shim at `[id]` → `/admin/campaigns/[id]`). Fundraiser pages → `/admin/p2p/fundraisers/`
- **configStore snapshot**: `useCampaignConfigStore.fundraisers` is initialized once; always sync it after `updateCampaign()` when `configStore.id === campaign.id`
