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

**v-html sanitization**: ALL `v-html` usage MUST sanitize content using `sanitizeRichText()` from `~/features/_library/form-builder/utils/sanitize-html.ts`. Use `replaceRichTextVariables()` for template variable substitution. Never render unsanitized HTML.

## Project Summary

<!-- regenerate with /update-project-summary -->

| Feature       | Path                                   | Purpose                                                                                              |
| ------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| donation-form | `app/features/donation-form/`          | Multi-step donation wizard with 12 sub-features (cover-costs, gift-aid, impact-cart, tribute, etc.)  |
| campaigns     | `app/features/campaigns/`              | Campaign CRUD, crowdfunding, P2P fundraising, templates                                              |
| donations     | `app/features/donations/`              | Admin donation list/detail: columns, composables                                                     |
| donors        | `app/features/donors/`                 | Admin donor list/detail: columns, composables, types                                                 |
| donor-portal  | `app/features/donor-portal/`           | Donor dashboard: transaction history, fundraiser management                                          |
| products      | `app/features/products/`               | Admin product management: columns, composables, forms, types                                         |
| subscriptions | `app/features/subscriptions/`          | Subscription management: admin list/detail, donor card + actions                                     |
| settings      | `app/features/settings/`               | Org config: general, branding, team, API, billing, payments (Stripe/PayPal Connect)                  |
| templates     | `app/features/templates/`              | Admin template config: certificates, receipts, ecards with preview components                        |
| form-builder  | `app/features/_library/form-builder/`  | Schema-driven form framework: defineForm API, 16 field types, conditions, containers                 |
| custom-fields | `app/features/_library/custom-fields/` | Admin-configurable dynamic fields with 8 field type factories                                        |
| \_admin       | `app/features/_admin/`                 | Shared admin UI: sidebar, breadcrumbs, data table, detail rows, delete dialog, edit layouts, columns |

**Key stores:** `donation-form/shared/stores/formConfig.ts` (admin config), `donation-form/donor/stores/donationForm.ts` (donor state, per-form-ID persistence), `donation-form/features/impact-cart/donor/stores/impactCart.ts` (cart by frequency, per-form-ID persistence), `campaigns/shared/stores/campaignConfig.ts` (campaign config), `campaigns/shared/stores/forms.ts` (campaign forms), `settings/admin/stores/charitySettings.ts` (charity identity, slug, per-currency overrides), `settings/admin/stores/currencySettings.ts` (org currencies), `settings/admin/stores/generalSettings.ts`, `settings/admin/stores/brandingSettings.ts`, `settings/admin/stores/teamSettings.ts`, `settings/admin/stores/paymentSettings.ts`, `settings/admin/stores/apiSettings.ts`, `settings/admin/stores/billingSettings.ts`, `templates/admin/stores/certificateTemplate.ts`, `templates/admin/stores/ecardTemplates.ts`, `templates/admin/stores/receiptTemplate.ts`.

**Key composables:** `useCampaigns()`, `useForms()`, `useCampaignShare()`, `useCampaignPreview()`, `useCampaignFormatters()`, `useDonorPortal()`, `useSubscriptionActions()`, `useAdminSubscriptions()`, `useDonations()`, `useDonors()`, `useProducts()`, `useCurrency()`, `useDonationCurrencies()`, `useAdminConfigForm()`, `useAdminEdit()`.

**Layouts:** `admin.vue`, `admin-preview.vue`, `donor.vue`, `portal.vue`, `default.vue`.

**Pages:** `app/pages/admin/` (dashboard, campaigns, forms, donations, donors, products, subscriptions, templates: certificates/ecards/receipts, settings: general/branding/team/api/billing/payments), `app/pages/[org_slug]/` (donor-facing: campaign pages, forms, P2P onboarding/templates), `app/pages/portal/` (donor dashboard: donations, subscriptions, fundraisers), `app/pages/index.vue` (landing).

<!-- end project summary -->

## Code Rules

YOU MUST ALWAYS FOLLOW THESE RULES (COMMANDMENTS):

1. **THINK → PLAN → WORK**: MUST identify root causes, explore 5+ approaches, choose the most minimal elegant solution. Think of 5+ solutions that are minimal, elegant, pattern-following, maintainable, readable and DRY with pros/cons and star rating for each. Pick the best, explain why. Make a detailed plan with steps before coding.
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
17. **KEEP PROJECT SUMMARY CURRENT**: After completing any task that adds, removes, renames, or restructures features, stores, composables, pages, or layouts, you MUST ask yourself: "Did I change the project structure?" If yes, tell the user in **bold** at the end of your final message: **"Project structure changed — run `/update-project-summary` to keep CLAUDE.md current."**
18. **COMMIT MESSAGE STANDARD**: Use short conventional commits following rule #16. NEVER include the "Authored by Anthropic" line in commit messages. Always check for all staged changes `git --no-pager diff --staged` before writing the commit message.
