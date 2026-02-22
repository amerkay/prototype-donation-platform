---
paths:
  - 'app/features/templates/**'
  - 'app/pages/admin/templates/**'
---

# Templates Feature

Certificate, receipt, and email templates with tokenized card system and model-driven rendering.

## Key files

- **Stores:** `admin/stores/certificateTemplate.ts`, `emailTemplate.ts`, `receiptTemplate.ts` (receiptTemplate uses `defineSettingsStore`)
- **Composables:** `admin/composables/useCertificateTemplates.ts`, `useEmailTemplates.ts` (8 editable donor + eCard templates; system emails in `app/emails/system/templates.ts`)
- **Preview:** `admin/composables/useCertificatePreviewModel.ts` (template → model converter), `useEmailPreviewContext.ts` (sample data aggregator), `useEmailRenderPayload.ts` (email assembler)
- **Types:** `admin/types.ts` — CertificateTemplate, EmailTemplate, ReceiptTemplate, template metadata
- **Card system:** `admin/components/cards/` — tokenized card components for email templates

## Email card system

- **7 tokenized cards:** `{{ IMPACT_PRODUCT_CARD }}`, `{{ DONATION_SUMMARY_CARD }}`, `{{ SUBSCRIPTION_STATUS_CARD }}`, `{{ ORDER_BREAKDOWN_CARD }}`, `{{ PAYMENT_RETRY_CARD }}`, `{{ PAYMENT_METHOD_CARD }}`, `{{ CAMPAIGN_CONTEXT_CARD }}`
- **Parser:** `emails/components/cards/registry.ts` — `splitBodyIntoCardSegments()` parses body HTML, replaces tokens with card components
- **See:** `.claude/rules/emails.md` for full email template documentation

## Patterns

- **v-html sanitization:** ALL `v-html` MUST use `sanitizeRichText()` from `~/features/_library/form-builder/utils/sanitize-html.ts`
- **Template variables:** Use `processTemplateRichText()` from `~/features/templates/admin/utils/template-rich-text.ts` for variables (DONOR_NAME, AMOUNT, DATE)
- **Certificate preview:** Loads Bunny fonts via `useHead()`, resolves branding + charity settings dynamically
- **Email preview:** Aggregates sample data from 4 composables (campaigns, donations, subscriptions, products)
- **PDF generation:** Certificate/receipt preview URLs → `server/api/pdf.post.ts` (Puppeteer) → download
