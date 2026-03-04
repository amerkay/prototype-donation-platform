---
paths:
  - "app/emails/**"
---

# Email Templates — Nuxt Email Renderer

## To modify email body rendering

1. The main template is `app/emails/DonationEmail.vue` — it renders body HTML + tokenized card slots
2. Body HTML contains card tokens (e.g., `{{ IMPACT_PRODUCT_CARD }}`). These are parsed by `splitBodyIntoCardSegments()` in `components/cards/registry.ts`
3. ALL body HTML must be sanitized via `sanitizeRichText()` with `profile: 'email'`
4. Uses `nuxt-email-renderer` — auto-imports `E*` components: `EHtml`, `EHead`, `EBody`, `EContainer`, `ESection`, `EHeading`, `EText`, `EButton`, `EStyle`, `EFont`

## To add a new email card

1. Create the card component in `app/emails/components/cards/`
2. Use layout primitives from `components/cards/layouts/` (shell, action button, info panel, media row, media stack)
3. Define the card's data interface in `components/cards/types.ts` (add to `EmailCardToken` and `EmailCardsPayload`)
4. Register the component in `components/cards/registry.ts` card component map
5. Card layouts use **inline styles and table-based layout** for email client compatibility — no Tailwind

## To connect with admin template editing

Admin-side email template config lives in `app/features/templates/admin/` (store: `emailTemplate.ts`, composable: `useEmailTemplates()`). System emails are hard-coded in `app/emails/system/templates.ts` and are NOT admin-editable.
