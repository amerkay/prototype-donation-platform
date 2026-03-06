# Donation Platform Prototype

Multi-step donation platform: single/recurring donations, multi-item cart, dynamic pricing sliders, mobile-first progressive disclosure. Nuxt 4 + Vue 3.5 + TypeScript + Tailwind CSS 4 + shadcn-vue.

## Commands

```bash
pnpm test:run              # All tests
pnpm test:nuxt -- test/nuxt/path/to/spec.ts              # Single nuxt test file
pnpm test:nuxt -- test/nuxt/path/to/spec.ts -t "name"   # Single nuxt test by name
pnpm typecheck             # Type checking
pnpm format:fix; pnpm lint:fix  # Fix formatting + lint (defer till end)
pnpm analyze:dead              # Unused files, exports, dependencies (Knip)
pnpm analyze:dupes             # Copy-paste duplicate code blocks (jscpd)
pnpm analyze:long [N] [lines]  # Top N files by line count, flagged over threshold (default: 30, 300)
pnpm analyze:circular          # Circular imports between composables/stores (madge, excludes ui/)
pnpm dlx shadcn-vue@latest add [component]  # Add shadcn-vue component
python3 scripts/extract-prompts.py [N]     # Last N sessions' prompts & Q&A (default: 3, --all for all)
```

## Dev Server (Docker VM)

Start the dev server in the background with `--host 0.0.0.0` so it's accessible outside the container:

```bash
pnpm dev --host 0.0.0.0  # run in background via Bash tool
```

After startup, check the output for the actual `Network:` URL (the IP changes between sessions — e.g. `172.17.0.2`, `172.17.0.3`). Always output the **actual** address from the log, not a hardcoded one.

## Playwright

Playwright + Chromium is installed (via npx). Use `npx playwright` to run tests. Example:

```bash
npx playwright test                     # Run all Playwright tests
npx playwright test tests/e2e/foo.spec.ts  # Single test file
```

The dev server must be running before Playwright tests (see above).

## Critical Patterns

**CRUD pattern** (campaigns, products, certificates, emails): Singleton composable (`useSessionStorageSingleton`) → Card listing (`AdminCardGrid` + `AdminEntityCard` with #image/#badges/#stats/#actions) → Pinia edit store (`useEditableState`) → Edit page (`EditLayout` + `useEditState` from `_shared/`) → Config form (`AdminConfigPanel` + FormRenderer + `StickyButtonGroup`). Delete protection via `getDeleteProtection()`. Smart dirty detection: `useEditState` reads `originalData` from `store.toSnapshot()`, NOT composable.

**Admin list pattern** (donations, donors, subscriptions): `AdminListPage` + `DataTable` + `AdminFilterSheet`. Cross-entity filtering: `useEntityDataService` + `buildCustomFieldSchema` + `withCustomFieldEvaluators`.

**Form-builder for ALL forms**: Use `defineForm()`, field constructors, `FormRenderer`. Read `app/features/_library/form-builder/README.md` first. NON-NEGOTIABLE.

**`_library/` is sacred**: `form-builder` and `custom-fields` must NEVER contain donation-specific logic. Read READMEs first: `app/features/_library/form-builder/README.md`, `app/features/_library/custom-fields/README.md`.

**Admin previews**: Populate real Pinia stores with sample data, render real donor components. Never inject preview context into donor components.

**v-html sanitization**: ALL `v-html` → `sanitizeRichText()` from `~/features/_library/form-builder/utils/sanitize-html.ts`. Templates with variables → `processTemplateRichText()` from `~/features/templates/admin/utils/template-rich-text.ts`.

**Empty states**: ALL empty/no-results UI MUST use `Empty` + `EmptyHeader`/`EmptyTitle`/`EmptyDescription`/`EmptyMedia` from `@/components/ui/empty/`. Never hand-roll empty state markup.

**Save/discard**: ALL admin/portal settings pages MUST use `StickyButtonGroup` from `~/features/_admin/components/StickyButtonGroup.vue`. Never custom button bars.

**AlertDialogs**: Must be separate components — never inline. Reuse `AdminDeleteDialog` for simple confirmations.

**Terminal state**: `editableMode = ref(!isTerminal.value)`, pass `editable={undefined}` to `EditLayout` when terminal.

## Architecture

**Vertical Slice**: Organize by WHO uses it (`admin/` vs `donor/`), not what it displays.

```
app/features/[feature-name]/
  admin/       → config panels, preview tools, admin forms
  donor/       → forms, wizards, donor-facing state
  shared/      → only when BOTH sides import it (80%+ rule)
```

**Type organization**: Config types (`*Settings`) → `admin/types.ts`. Runtime types → `admin/` or `donor/types.ts` by primary consumer. Truly shared (~50/50) → `shared/types.ts`.

**`_library/`**: Domain-agnostic reusable modules (form-builder, custom-fields).
**`_admin/`**: Admin-specific UI — sidebar, list pages, detail cards, config panels, quick find.
**`_shared/`**: Cross-boundary infrastructure — BreadcrumbBar, DataTable, EditLayout, useEditState, useEntityDataService, NavUser, column/filter utils.

<!-- regenerate with /update-project-summary -->

## Project Summary

### Features

| Feature         | Path                      | Purpose                                                                                       |
| --------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| `_admin`        | `features/_admin/`        | Admin shell: sidebar, card grids, config panels, quick find                                   |
| `_library`      | `features/_library/`      | Domain-agnostic: `form-builder`, `custom-fields`                                              |
| `_shared`       | `features/_shared/`       | Cross-boundary: EditLayout, DataTable, useEditState, useEntityDataService                     |
| `campaigns`     | `features/campaigns/`     | Campaign CRUD + create wizard. 4 sub-features: crowdfunding, matched-giving, p2p, sharing     |
| `donation-form` | `features/donation-form/` | Form builder + donor checkout. 13 sub-features (impact-cart, cover-costs, gift-aid, tribute…) |
| `donations`     | `features/donations/`     | Admin donation list, filters, refund actions                                                  |
| `donor-portal`  | `features/donor-portal/`  | Donor self-service: donations, subscriptions, fundraisers, my-data                            |
| `donors`        | `features/donors/`        | Admin donor list and filters                                                                  |
| `products`      | `features/products/`      | Product/impact item CRUD                                                                      |
| `settings`      | `features/settings/`      | Org settings: branding, currency, payments, team, billing, social, after-sale, API (11 pages) |
| `subscriptions` | `features/subscriptions/` | Recurring subscription management (totalAmount = subtotal + coverCostsAmount)                 |
| `templates`     | `features/templates/`     | Email, receipt, certificate template editing with live preview                                |

### Key Stores

- `campaigns/shared/stores/campaignConfig.ts` — campaign edit store (CRUD)
- `donation-form/shared/stores/formConfig.ts` — donation form config edit store
- `donation-form/donor/stores/donationForm.ts` — donor-side form runtime state
- `donation-form/features/impact-cart/donor/stores/impactCart.ts` — cart state for impact items
- `products/admin/stores/product.ts` — product edit store
- `templates/admin/stores/emailTemplate.ts` — email template edit store
- `templates/admin/stores/receiptTemplate.ts` — receipt template edit store
- `templates/admin/stores/certificateTemplate.ts` — certificate template edit store
- `settings/admin/stores/` — 11 settings stores (one per settings page)

### Key Composables

- `_admin/composables/defineEditableStore.ts` — factory for CRUD entity stores
- `_admin/composables/defineSettingsStore.ts` — factory for settings page stores
- `_admin/composables/useSessionStorageSingleton.ts` — singleton list data with session caching
- `_admin/composables/useQuickFind.ts` — global admin search
- `_shared/composables/useEditState.ts` — dirty detection + save/discard for edit pages
- `_shared/composables/useEntityDataService.ts` — cross-entity filtering for list pages
- `_shared/composables/useCompliance.ts` — GDPR/legal compliance utilities
- `campaigns/shared/composables/useCampaigns.ts` — campaign list singleton
- `campaigns/shared/utils/campaignCapabilities.ts` — feature-gating by campaign type (15 flags)
- `campaigns/features/matched-giving/donor/composables/useMatchedGiving.ts` — provide/inject for match display
- `campaigns/features/p2p/admin/composables/useFundraisers.ts` — P2P fundraiser list
- `donation-form/donor/composables/useDonationFormContext.ts` — donor checkout context
- `donation-form/donor/composables/useBuildTransaction.ts` — transaction assembly
- `donation-form/shared/composables/useCurrency.ts` — currency formatting
- `donations/admin/composables/useDonations.ts` — donation list singleton
- `donors/admin/composables/useDonors.ts` — donor list singleton
- `donor-portal/composables/useDonorPortal.ts` — portal data + navigation
- `donor-portal/composables/useActionEligibility.ts` — donor action eligibility checks
- `subscriptions/admin/composables/useAdminSubscriptions.ts` — subscription list singleton
- `subscriptions/shared/composables/useSubscriptionActions.ts` — subscription lifecycle actions
- `templates/admin/composables/useEmailTemplates.ts` — email template list singleton
- `templates/admin/composables/useCertificateTemplates.ts` — certificate template list singleton

### Layouts

`admin`, `admin-preview`, `default`, `donor`, `portal`, `print`

### Pages

- **Admin** `/admin/` — dashboard, campaigns (list + edit + form edit/preview), donations, donors, products, subscriptions, p2p (templates + fundraisers), settings (11 pages + payments/connect), templates (emails, receipts, certificates)
- **Donor** `/[org_slug]/` — crowdfunding page, donation form, P2P templates + onboarding
- **Portal** `/portal/` — donation history, subscriptions, fundraisers (list + detail + edit), my-data
- **Other** — print (receipt, certificate), terms, design system preview

<!-- end project summary -->

## Code Standards

- **Component order**: `<script setup lang="ts">`. Imports, constants, props/emits, state, computed, methods.
- **Styling**: NEVER concatenate classes. Use `cn()` from `@/lib/utils`. Explicit conditionals for dynamic classes.
- **shadcn-vue**: Consult `.claude/shadcn-vue-components.md` for available components. Docs: `https://www.shadcn-vue.com/docs/components/[component].html`.
- **Internal links**: NEVER use `<a>` for internal navigation. Always `NuxtLink`. In `.ts` files: `import { NuxtLink } from '#components'`.
- **Nuxt nested routes**: `pages/foo/index.vue` + `pages/foo/[id].vue` for siblings. NOT `pages/foo.vue` + `pages/foo/[id].vue` (that's parent-child).

<!-- continuous learning notes -->

## Continuous Learning

1. `componentField` excluded from autoMap; persist via `$storePath` or manual getData/setData
2. reka-ui combobox: avoid manual open/select handlers that fight internal state
3. `$storePath` deep writes silently fail if intermediates missing; stores must pre-populate
4. Cross-field validation in tabs: use dynamic `rules(ctx)` reading sibling `values`
5. Prototype — bias toward simple, direct solutions over future-proof abstractions
6. Accordion IDs prefixed with section ID (e.g., `product.basic`, not `basic`)
7. Currency removal must check form usage (enabledCurrencies/baseDefaultCurrency) before saving
8. Supabase migration: search `TODO-SUPABASE`. Schema: `SUPABASE_SCHEMA_DRAFT.md`, notes: `SUPABASE_NOTES.md`
9. Stripe API security: `STRIPE_API_NOTES.md` — server-side verification for all eligibility gates
10. Immutable records: generate receipt/certificate PDFs at donation time, store on S3
11. Refunds = negative transactions with `refund_of_transaction_id` FK. Cover costs → charity, no special treatment
12. GDPR: anonymize PII (don't delete), keep financial data (Article 17(3)(b)). `consent_records` table
13. HMRC Gift Aid: `gift_aid_declarations` table — 6-year retention after last covered donation
14. System emails hard-coded in `app/emails/system/templates.ts`, not admin-editable
15. `fieldGroup` nests data: `fieldGroup('name', { fields: { firstName } })` → `{ name: { firstName } }`
16. Currency totals: `totalAmount × exchangeRate` = base; `× campaignExchangeRate` = campaign currency (immutable after creation)
17. Donor value for eligibility is per-org (`charityName`), not global
18. P2P status: Campaign `draft|active|completed|ended`; Templates `draft|active`; Fundraisers `active|completed|ended`
19. `configStore.fundraisers` is a snapshot — always sync after `updateCampaign()` when `configStore.id === campaign.id`
20. Test commands: `pnpm test:nuxt -- <path>` for nuxt tests (not `pnpm test:run --`); `pnpm test:run` runs all projects
21. `BaseDialogOrDrawer` uses teleport — stub it in tests to render slots inline (Dialog content is invisible to `wrapper.text()`)
22. `visibleWhen` closures in `defineForm` read Pinia stores at call time (not at module init) — call `form.setup(ctx)` directly to unit-test visibility logic against store state
23. Derived/computed data must have ONE source of truth — never duplicate the same calculation in multiple components/pages. Centralize in composables and consume from there
24. `data-field` paths must match form field TREE (not $storePath). Use plain `as const satisfies Record<keyof T, string>` for TARGETS objects — validate against typed interfaces from `shared/types.ts`. Tab/group names → shared `as const` constants used in both tab definition and targets
25. Use `$storePath: 'flatten'` for identity store mappings; auto-excludes display-only fields (alert, readonly, card, component)
26. Store `initialize()` must deep-clone inputs (`JSON.parse(JSON.stringify(...))`) — shallow spread/assign shares nested refs with source, corrupting discard
27. Spread-then-override merges (`{ ...parent, id, name }`) silently drop unlisted fields — audit every field when adding to merge objects
28. Singleton Pinia stores shared by multiple components: guard re-initialization with ID check (`if (store.formId !== newId)`) to avoid clobbering live edits
29. Bug-fix tests MUST be mutation-tested: revert the fix, confirm the test fails, then restore. Tests that pass without the fix are worthless
30. Test data integrity with REAL stores (not mocks) — mock stores can't reproduce shared-reference bugs that only manifest through actual `ref()` assignment
31. shadcn-vue components (e.g. `Empty`, `Input`) need explicit imports — they are NOT Nuxt auto-imported
32. `useFormSearch` filters hidden fields reactively via `visibilityChecks` stored in the search index — pass `FieldContext` getter as 3rd arg

<!-- end continuous learning notes -->

## Code Rules

1. **PLAN FIRST**: Present 3+ options with 1-line desc + star rating (★) during planning. Questions only during planning, never mid-implementation. ALWAYS use the `AskUserQuestion` tool for questions — never inline questions in text output. Every question option MUST include pros/cons and a star rating (★–★★★★★) in the description or preview so the user can make informed decisions at a glance.
2. **INVESTIGATE + FOLLOW PATTERNS**: Search codebase for similar patterns before writing code. Match conventions exactly.
3. **FORM-BUILDER FOR ALL FORMS**: Use `defineForm()`, field constructors, `FormRenderer`. Read README first. NON-NEGOTIABLE.
4. **`_library/` IS SACRED**: No donation logic in form-builder or custom-fields.
5. **TESTS UNCOVER BUGS**: If a test fails on sensible assertions, STOP and report — don't change test to match broken behavior.
5b. **BUG FIX = TEST + MUTATION VERIFY**: Every bug fix MUST include a regression test. Verify by commenting out/reverting the fix and confirming the test fails. If the test passes without the fix, the test is worthless — fix it. Only restore the fix after the test is proven to catch the regression.
6. **DEFER FORMATTING**: Batch at end — run all four checks **in parallel** (separate Bash tool calls in one message): `pnpm typecheck`, `pnpm test:run`, `pnpm format:fix`, `pnpm lint:fix`.
7. **SUMMARIES + MEMORY**: Brief updates after each answer. End with conventional commit message. After tasks: check if structure changed (→ `/update-project-summary`), if learned something durable (→ update CL), if data models changed (→ update Supabase docs). Keep CL bullets ≤1 line, never duplicate — merge or clarify.
8. **COMMITS**: Short conventional commits. Check `git --no-pager diff --staged` first. No "Authored by Anthropic" line.
9. **TODO LISTS**: When implementing multi-step plans or complex tasks, use the `TaskCreate` tool to build a task list. Update tasks to `in_progress` before starting and `completed` when done. This keeps progress visible in the Claude Code UI and ensures nothing is missed.

## Superpowers Overrides

- **No auto-commits**: NEVER commit automatically. Only commit when I explicitly ask.
- **No worktrees**: NEVER use git worktrees. Work directly on the current branch.
