---
paths:
  - "app/emails/**"
---

# Email Templates — Nuxt Email Renderer

Uses `nuxt-email-renderer` (auto-imports `E*` components: `EHtml`, `EHead`, `EBody`, `EContainer`, `ESection`, `EHeading`, `EText`, `EButton`, `EStyle`, `EFont`, etc.).

## Structure

- `app/emails/DonationEmail.vue` — main template, renders body HTML + tokenized card slots
- `app/emails/components/cards/` — 7 card components
- `app/emails/components/cards/layouts/` — shared card layout primitives (shell, action button, info panel, media)
- `app/emails/components/cards/registry.ts` — card component map + `splitBodyIntoCardSegments()` parser
- `app/emails/components/cards/types.ts` — `EmailCardToken`, per-card data interfaces, `EmailCardsPayload`

## Key patterns

- Card tokens (`{{ IMPACT_PRODUCT_CARD }}` etc.) embedded in body HTML, resolved at render via `splitBodyIntoCardSegments()`
- All body HTML sanitized via `sanitizeRichText()` with `profile: 'email'`
- Card layout primitives use inline styles and table-based layout for email client compatibility — no Tailwind
- Admin-side email template config in `app/features/templates/admin/` (store: `emailTemplate.ts`, composable: `useEmailTemplates()`)
