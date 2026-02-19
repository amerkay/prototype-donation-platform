# Donation Platform Prototype

Multi-step donation platform: single/recurring donations, multi-item cart, dynamic pricing sliders, mobile-first progressive disclosure. Nuxt 4 + Vue 3.5 + TypeScript + Tailwind CSS 4 + shadcn-vue.

## Commands

```bash
pnpm test:run              # All tests
pnpm test:run -- test/nuxt/path/to/spec.ts -t "test name"  # Single test
pnpm typecheck             # Type checking
pnpm format:fix; pnpm lint:fix  # Fix formatting + lint (defer till end)
pnpm dlx shadcn-vue@latest add [component]  # Add shadcn-vue component
```

Do NOT run `pnpm dev` — no browser access.

## Architecture

**Vertical Slice Architecture**: organize by WHO uses it (`admin/` vs `donor/`), not what it displays.

```
app/features/[feature-name]/
  admin/       → config panels, preview tools, admin forms
  donor/       → forms, wizards, donor-facing state
  shared/      → only when BOTH sides import it (80%+ rule)
```

**Rules**: If 80%+ usage is one side, move it there. Stores follow their primary consumer.

**Type Organization**:

- Config types (`*Settings` interfaces) → `admin/types.ts`
- Runtime types (data models, state shapes) → `donor/types.ts` or `admin/types.ts` based on primary consumer
- Truly shared types (used ~50/50 by both) → `shared/types.ts`

**Library modules** (`app/features/_library/`): form-builder and custom-fields are **reusable, domain-agnostic**. They MUST NEVER contain donation-specific logic. When working with these modules, ALWAYS read their README.md first:

- `app/features/_library/form-builder/README.md` — defineForm API, field types, containers, conditions, store mapping
- `app/features/_library/custom-fields/README.md` — field factories, admin config, runtime rendering

**Admin infrastructure** (`app/features/_admin/`): shared admin UI (sidebar, layouts, composables).

## Code Standards

**Components**: `<script setup lang="ts">`. Order: imports, constants, props/emits, state, computed, methods. PascalCase components, camelCase variables, UPPER_SNAKE_CASE constants.

**Styling**: NEVER concatenate classes. Use `cn()` from `@/lib/utils`. Explicit conditionals for dynamic classes.

**State**: Local `ref()`/`computed()` in components. Composables for shared state. No prop mutations — emit events.

**Validation**: vee-validate + Zod. Schema per field type.

**shadcn-vue**: Do not edit `app/components/ui/` unless necessary. For frontend tasks needing ready-made components, consult `.claude/shadcn-vue-components.md` (lists all components with purposes). Use the docs URL template in that file (`https://www.shadcn-vue.com/docs/components/[component].html`) to read full documentation before building custom UI.

**Save/Discard actions**: All admin and donor portal settings pages with save/discard functionality MUST use `StickyButtonGroup` from `~/features/_admin/components/StickyButtonGroup.vue`. Never create custom save/discard button bars.

**v-html sanitization**: ALL `v-html` usage MUST sanitize content using `sanitizeRichText()` from `~/features/_library/form-builder/utils/sanitize-html.ts`. For templates with variables, use `processTemplateRichText()` from `~/features/templates/admin/utils/template-rich-text.ts`. Never render unsanitized HTML.

## Project Summary

<!-- regenerate with /update-project-summary -->

| Feature       | Path                                   | Purpose                                                                                                                                            |
| ------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| donation-form | `app/features/donation-form/`          | Multi-step donation wizard with 13 sub-features (contact-consent, cover-costs, custom-fields, donor-info, entry-fields, gift-aid, impact-boost, impact-cart, product, product-selector, shipping-notice, terms, tribute); 9 form templates (incl. registration, stall-booking, dog-show-entries) |
| campaigns     | `app/features/campaigns/`              | Campaign CRUD, crowdfunding, P2P fundraising, card grid listing + edit pages                                                                       |
| donations     | `app/features/donations/`              | Admin donation list/detail: columns, composables, custom field filters                                                                             |
| donors        | `app/features/donors/`                 | Admin donor list/detail: columns, composables, cross-entity custom field filters                                                                   |
| donor-portal  | `app/features/donor-portal/`           | Donor dashboard: transaction history, fundraiser management                                                                                        |
| products      | `app/features/products/`              | Impact product CRUD: card grid listing, edit page with preview, forms, store, ProductPickerList for form linking                                     |
| subscriptions | `app/features/subscriptions/`          | Subscription management: admin list/detail, donor card + actions, cross-entity custom field filters                                                 |
| settings      | `app/features/settings/`               | Org config: general, branding, charity (structured address + per-currency overrides), currency, team, API, billing, payments, social-sharing        |
| templates     | `app/features/templates/`              | Certificates, receipts, emails: card grid listing, edit pages, tokenized card system, model-driven Vue SFC rendering                               |
| emails        | `app/emails/`                          | nuxt-email-renderer templates: DonationEmail + 7 tokenized card components                                                                         |
| form-builder  | `app/features/_library/form-builder/`  | Schema-driven form framework: defineForm API, 18 field types, conditions, containers, filters                                                      |
| custom-fields | `app/features/_library/custom-fields/` | Admin-configurable dynamic fields with 8 field type factories                                                                                      |
| \_admin       | `app/features/_admin/`                 | Shared admin UI: sidebar, breadcrumbs, data table, edit layouts, AdminListPage, AdminConfigPanel, PreviewEditable, entity data service, quick find, custom field schema builder |

**CRUD pattern (campaigns, products, certificates, emails):** Singleton composable (`useSessionStorageSingleton`) → Card listing (`index.vue` + `*Card.vue` with StatusBadge/AdminDeleteButton) → Pinia edit store (`useEditableState`) → Edit page (`[id].vue` + `AdminEditLayout` + `useAdminEdit`) → Config form (`AdminConfigPanel` wrapping FormRenderer + StickyButtonGroup). Utility: `app/lib/generateEntityId.ts`. **Delete protection:** Each composable exposes `getDeleteProtection(id): DeleteProtection` (interface in `useAdminEdit.ts`) — Cards and Headers both call it for consistent disabled state. **Toast wrappers:** `update*Name()`/`update*Status()` methods in each composable show sonner toasts; raw `update*()` is silent (used by `store.save()` which toasts via `useAdminEdit`). **Smart dirty detection:** `useAdminEdit` patches `store.markDirty()` with deep comparison (`hasChanges` computed) so `isDirty` auto-clears when form values return to saved state.

**Admin list pattern (donations, donors, subscriptions):** `AdminListPage` component wraps breadcrumbs, page header with date range picker + filter button + quick find + export dropdown, `AdminDataTable`, and `AdminFilterSheet` with `FormRenderer`. Each page provides columns, data, filter composable, and export mapper via `#export-menu` slot. `useEntityDataService` (singleton) provides cross-entity lookup maps. `useQuickFind` adds debounced text search. Filter composables use `useFilterState` with dynamic schemas (product names, custom fields scanned from data) and custom evaluators for cross-entity + JSONB custom field conditions. `buildCustomFieldSchema` (`_admin/utils/`) scans transaction `customFields` for dynamic filter schema; `withCustomFieldEvaluators` uses Proxy for cross-entity custom field evaluation without pre-registration.

**Key stores:** `donation-form/shared/stores/formConfig.ts` (admin config), `donation-form/donor/stores/donationForm.ts` (donor state, per-form-ID persistence), `donation-form/features/impact-cart/donor/stores/impactCart.ts` (cart by frequency, per-form-ID persistence), `campaigns/shared/stores/campaignConfig.ts` (campaign config), `campaigns/shared/stores/forms.ts` (campaign forms), `settings/admin/stores/charitySettings.ts` (charity identity, structured address, per-currency overrides), `settings/admin/stores/currencySettings.ts` (org currencies), `settings/admin/stores/generalSettings.ts`, `settings/admin/stores/brandingSettings.ts`, `settings/admin/stores/teamSettings.ts`, `settings/admin/stores/paymentSettings.ts`, `settings/admin/stores/apiSettings.ts`, `settings/admin/stores/billingSettings.ts`, `settings/admin/stores/socialSharingSettings.ts` (org-level social platform availability), `templates/admin/stores/certificateTemplate.ts`, `templates/admin/stores/emailTemplate.ts`, `templates/admin/stores/receiptTemplate.ts`, `products/admin/stores/product.ts`, `_admin/stores/adminDateRange.ts` (shared date range picker state).

**Key composables:** `useCampaigns()`, `useForms()`, `useCampaignShare()`, `useCampaignTypes()`, `useCampaignFormatters()`, `useDonorPortal()`, `useSubscriptionActions()`, `useAdminSubscriptions()`, `useDonations()`, `useDonors()`, `useProducts()`, `useCertificateTemplates()`, `useEmailTemplates()`, `useCurrency()`, `useDonationCurrencies()`, `useFormTypeLabels()`, `useDonationFormContext()`, `useAdminConfigForm()`, `useAdminEdit()`, `useSessionStorageSingleton()`, `useGeneratePdf()`, `useBrandingCssVars()`, `usePreviewEditable()`, `useFilterState()`, `useEntityDataService()`, `useQuickFind()`, `useExport()`.

**Layouts:** `admin.vue`, `admin-preview.vue`, `donor.vue`, `portal.vue`, `print.vue`, `default.vue`.

**Pages:** `app/pages/admin/` (dashboard, campaigns/standard+p2p/[id]/forms/[formId], donations/[id], donors/[id], products/[id], subscriptions/[id], templates: certificates/[id] + emails/[id] + receipts + email-cards-preview, settings: general/branding/charity/currency/team/api/billing/payments/social-sharing + payments/callback/stripe-connect/paypal-connect), `app/pages/[org_slug]/` (donor-facing: campaign pages, forms, P2P onboarding/templates), `app/pages/portal/` (donor dashboard: donations, subscriptions, fundraisers/[id]/index+edit), `app/pages/print/` (PDF render routes: certificate, receipt), `app/pages/preview-pangea.vue`, `app/pages/index.vue` (landing).

**Server API:** `server/api/pdf.post.ts` (PDF generation via Puppeteer), `server/api/print-data.get.ts` (token-based model retrieval), `server/api/export.post.ts` (data export), `server/api/send-email.post.ts` (email sending). **PDF utils:** `server/utils/pdf/generate-pdf.ts` (Puppeteer + @sparticuz/chromium), `server/utils/pdf/print-data-store.ts` (Nitro useStorage with netlify-blobs/fs drivers, 30s TTL).

<!-- end project summary -->

## Continuous Learning

<!-- continuous learning notes -->

1. `componentField` excluded from autoMap by default; persist via `$storePath` or manual getData/setData
2. With `reka-ui` combobox, avoid manual open/select handlers that fight internal state
3. `pnpm analyze` outputs chunk sizes mid-stream, not at end; grep for `.js` to find bundle info
4. UX polish: previews show real data (linked products, not placeholders), toasts on every save
5. Archived entities must disable destructive/additive actions (e.g., no adding products to archived templates)
6. `form-builder/filters/` provides `useFilterState(id, schema, options?)` — condition-builder-based filters with auto form+predicate+URL sync via `_f` param
7. `form-builder/conditions/ui/` houses condition builder UI (moved from custom-fields); condition barrel re-exports it

<!-- end continuous learning notes -->

## Code Rules

YOU MUST ALWAYS FOLLOW THESE RULES (COMMANDMENTS):

1. **THINK → PLAN → WORK**: MUST identify root causes, explore 5+ approaches, choose the most minimal elegant solution. Think of 5+ solutions that are minimal, elegant, pattern-following, maintainable, readable and DRY with pros/cons and star rating for each. Pick the best, explain why. Make a detailed plan with steps before coding. **Planning mode questions**: When using `AskUserQuestion` during planning, present each option with a 1-line description including pros/cons and a star rating (★★★★☆) based on minimal, readable, maintainable, DRY criteria. Batch related questions into a single `AskUserQuestion` call (up to 4). Do NOT ask questions mid-implementation — only during planning.
2. **INVESTIGATE FIRST**: YOU MUST ALWAYS start by searching the codebase for similar patterns or related files before writing any code.
3. **FOLLOW EXISTING PATTERNS**: MUST study similar files in codebase first. Match established conventions exactly.
4. **PREFER SHORTER CODE**: MUST prioritize readability and maintainability. Less code is ALWAYS better code.
5. **DRY PRINCIPLE**: MUST extract repeated logic. One responsibility per component. Never repeat code.
6. **MINIMAL EDITS**: MUST make the least changes to solve the problem. Remove all obsolete code immediately.
7. **FEATURE-BASED**: MUST place all feature code in `app/features/[feature-name]/`. Never violate architecture.
8. **TYPE SAFETY**: MUST use strict TypeScript. NEVER use `any` types. Mirror API structures exactly.
9. **SELF-CONTAINED LOGIC**: MUST prefer isolated, clear implementations. Avoid complex dependencies.
10. **USE shadcn-vue**: MUST use existing components or request missing ones. Do not reinvent UI.
11. **WRITE TESTS TO UNCOVER BUGS**: Do the tests make sense? Avoid testing buggy behavior as if it's correct. If a test fails on sensible assertions, STOP and report — do not change the test to match broken behavior.
12. **DEFER FORMATTING**: Do NOT fix lint/format issues one by one. Batch them at the end: `pnpm format:fix; pnpm lint:fix; pnpm typecheck`. These commands take up to 60 seconds.
13. **USE FORM-BUILDER FOR ALL FORMS**: ANY form or field definition MUST use `app/features/_library/form-builder/`. NEVER create forms manually with vee-validate or custom field components. Before building or modifying ANY form, you MUST read `app/features/_library/form-builder/README.md` in full. Use `defineForm()`, field constructors (`textField()`, `selectField()`, etc.), and `FormRenderer`. This is NON-NEGOTIABLE.
14. **`_library/` IS SACRED**: `app/features/_library/form-builder` and `app/features/_library/custom-fields` CAN NEVER have donation platform logic. They MUST be treated as independent reusable units.
15. **READ THE DOCS**: When working with form-builder or custom-fields, ALWAYS read the relevant README.md first (`app/features/_library/form-builder/README.md` or `app/features/_library/custom-fields/README.md`).
16. **SHORT SUMMARIES**: MUST provide brief updates after EACH answer. End with minimal conventional commit message about all the work we did in the entire session including compacted summaries unless I instruct you otherwise. The conv. commit first line must be a summary of all work done, and then bullet points with more details, keeping it concise.
17. **KEEP MEMORY CURRENT**: After completing any task:
    - Ask: "Did I change project structure?" If yes, bold reminder to run `/update-project-summary`
    - Ask: "Did I learn something crucial, durable, and reusable?" If yes, update the Continuous Learning section. Rules: keep bullets short (1 line, ~100 chars), NEVER duplicate — always merge or clarify existing bullets when related. Prune stale/obsolete entries.
    - Ask: "Did I change data models, API patterns, or filter/query logic?" If yes, update `app/sample-api-responses/SUPABASE_NOTES.md` (migration TODOs) and/or `app/sample-api-responses/SUPABASE_SCHEMA_DRAFT.md` (schema) to stay in sync. These docs are the Supabase migration blueprint — they must reflect current prototype state.
18. **COMMIT MESSAGE STANDARD**: Use short conventional commits following rule #16. NEVER include the "Authored by Anthropic" line in commit messages. Always check for all staged changes `git --no-pager diff --staged` before writing the commit message.
