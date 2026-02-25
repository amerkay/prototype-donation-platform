---
paths:
  - 'app/features/templates/**'
  - 'app/pages/admin/templates/**'
---

# Templates Feature

Certificate, receipt, and email templates with tokenized card system.

## Key files

- **Stores:** `admin/stores/certificateTemplate.ts`, `emailTemplate.ts`, `receiptTemplate.ts` (uses `defineSettingsStore`)
- **Composables:** `useCertificateTemplates.ts`, `useEmailTemplates.ts` (8 editable donor + eCard templates)
- **Preview:** `useCertificatePreviewModel.ts`, `useEmailPreviewContext.ts` (sample data aggregator), `useEmailRenderPayload.ts`
- **Card system:** `admin/components/cards/` — tokenized card components

## Email card tokens

7 tokens: `{{ IMPACT_PRODUCT_CARD }}`, `{{ DONATION_SUMMARY_CARD }}`, `{{ SUBSCRIPTION_STATUS_CARD }}`, `{{ ORDER_BREAKDOWN_CARD }}`, `{{ PAYMENT_RETRY_CARD }}`, `{{ PAYMENT_METHOD_CARD }}`, `{{ CAMPAIGN_CONTEXT_CARD }}`

**Parser:** `emails/components/cards/registry.ts` → `splitBodyIntoCardSegments()` parses body HTML, replaces tokens with card components.

## Patterns

- **Template variables:** `processTemplateRichText()` from `~/features/templates/admin/utils/template-rich-text.ts` for DONOR_NAME, AMOUNT, DATE
- **Certificate preview:** Loads Bunny fonts via `useHead()`, resolves branding + charity settings dynamically
- **Email preview:** Aggregates sample data from 4 composables (campaigns, donations, subscriptions, products)
