---
paths:
  - 'app/features/campaigns/**'
  - 'app/pages/admin/campaigns/**'
  - 'app/pages/[org_slug]/**'
---

# Campaigns Feature

Campaign CRUD with standard, crowdfunding, and P2P fundraising types. Each campaign has forms (donation wizards).

## Key files

- **Composables:** `shared/composables/useCampaigns.ts` (CRUD), `useForms.ts` (campaign forms), `useCampaignTypes.ts` (type metadata), `useCampaignShare.ts` (sharing), `useCampaignFormatters.ts` (currency/amount formatting)
- **Stores:** `shared/stores/campaignConfig.ts` (campaign edit state), `shared/stores/forms.ts` (form edit state)
- **Types:** `shared/types.ts` — Campaign, CampaignForm, CampaignType, CrowdfundingSettings, P2PSettings
- **Admin forms:** `admin/forms/campaign-config-master.ts` (defineForm), `crowdfunding-settings-form.ts`, `p2p-settings-form.ts`, `donation-forms-form.ts`
- **P2P templates:** `admin/templates/` — birthday, challenge, custom, tribute, wedding presets

## Patterns

- **Campaign types**: `standard` (basic), `crowdfunding` (goal + progress), `p2p` (fundraiser pages with templates)
- **Forms are children of campaigns**: each campaign has N forms, each form links to a donation-form config
- **Crowdfunding page**: `donor/components/CrowdfundingPage.vue` is both preview and live; admin preview renders real component
- **P2P onboarding**: wizard at `[org_slug]/p2p-onboard/[campaignId]` creates fundraiser pages from templates
- **Campaign links in admin**: `/admin/campaigns/standard/` and `/admin/campaigns/p2p/` are separate list pages; edit is `/admin/campaigns/[id]`
