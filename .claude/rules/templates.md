---
paths:
  - 'app/features/templates/**'
  - 'app/pages/admin/templates/**'
---

# Templates Feature

## To add an email card token

1. Define the token in `emails/components/cards/types.ts` — add to `EmailCardToken` enum and `EmailCardsPayload`
2. Create the card component in `emails/components/cards/`
3. Register it in `emails/components/cards/registry.ts` — the parser `splitBodyIntoCardSegments()` handles replacement
4. Current tokens: `IMPACT_PRODUCT_CARD`, `DONATION_SUMMARY_CARD`, `SUBSCRIPTION_STATUS_CARD`, `ORDER_BREAKDOWN_CARD`, `PAYMENT_RETRY_CARD`, `PAYMENT_METHOD_CARD`, `CAMPAIGN_CONTEXT_CARD`

## To modify template preview

1. Email preview aggregates sample data from 4 composables (campaigns, donations, subscriptions, products) via `useEmailPreviewContext.ts` → `useEmailRenderPayload.ts`
2. Certificate preview: uses `useCertificatePreviewModel.ts`, loads Bunny fonts via `useHead()`, resolves branding + charity settings dynamically

## To work with template variables

Use `processTemplateRichText()` from `~/features/templates/admin/utils/template-rich-text.ts` for substituting DONOR_NAME, AMOUNT, DATE, etc.

## To edit template stores

- Certificates: `admin/stores/certificateTemplate.ts`, list via `useCertificateTemplates.ts`
- Emails: `admin/stores/emailTemplate.ts`, list via `useEmailTemplates.ts` (6 donor + 2 eCard = 8 total)
- Receipts: `admin/stores/receiptTemplate.ts` (uses `defineSettingsStore`)

## Template admin components

Card UI components live in `admin/components/cards/` (tokenized card admin components, separate from the email renderer cards).
