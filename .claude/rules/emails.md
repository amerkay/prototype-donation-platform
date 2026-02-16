---
paths:
  - "app/emails/**"
---

# Email Templates — Nuxt Email Renderer

Uses [`nuxt-email-renderer`](https://nuxtemail.com/getting-started/usage) (auto-imports `E*` components: `EHtml`, `EHead`, `EBody`, `EContainer`, `ESection`, `EHeading`, `EText`, `EButton`, `EStyle`, `EFont`, etc.).

## Structure

- `app/emails/DonationEmail.vue` — main email template, renders body HTML + tokenized card slots
- `app/emails/components/cards/` — 7 card components (donation summary, impact product, order breakdown, etc.)
- `app/emails/components/cards/layouts/` — shared card layout primitives (shell, action button, info panel, media)
- `app/emails/components/cards/registry.ts` — card component map + `splitBodyIntoCardSegments()` parser
- `app/emails/components/cards/types.ts` — `EmailCardToken`, per-card data interfaces, `EmailCardsPayload`

## Key patterns

- Use `nuxt-email-renderer` auto-imported components (`EHtml`, `EHead`, `EBody`, `EContainer`, `ESection`, `EStyle`, `EText`, `EHeading`, `EButton`, `EFont`, etc.) for email-safe markup.
- Card tokens (`{{ IMPACT_PRODUCT_CARD }}` etc.) are embedded in body HTML and resolved at render time via `splitBodyIntoCardSegments()`.
- All body HTML is sanitized via `sanitizeRichText()` with `profile: 'email'` before rendering.
- Card layout primitives use inline styles and table-based layout for email client compatibility — no Tailwind.
- Admin-side email template config lives in `app/features/templates/admin/` (store: `emailTemplate.ts`, composable: `useEmailTemplates()`).
- Check `node_modules/nuxt-email-renderer/` source code for component props, slots, and rendering internals when docs are insufficient.
