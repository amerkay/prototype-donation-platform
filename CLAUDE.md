# Donation Platform Prototype

Multi-step donation platform: single/recurring donations, multi-item cart, dynamic pricing sliders, mobile-first progressive disclosure. Nuxt 4 + Vue 3.5 + TypeScript + Tailwind CSS 4 + shadcn-vue.

## Commands

```bash
pnpm test:run              # All tests
pnpm test:nuxt -- test/nuxt/path/to/spec.ts              # Single nuxt test file
pnpm test:nuxt -- test/nuxt/path/to/spec.ts -t "name"   # Single nuxt test by name
pnpm typecheck             # Type checking
pnpm format:fix; pnpm lint:fix  # Fix formatting + lint (defer till end)
pnpm dlx shadcn-vue@latest add [component]  # Add shadcn-vue component
python3 scripts/extract-prompts.py [N]     # Last N sessions' prompts & Q&A (default: 3, --all for all)
```

Do NOT run `pnpm dev` — no browser access.

## Critical Patterns

**CRUD pattern** (campaigns, products, certificates, emails): Singleton composable (`useSessionStorageSingleton`) → Card listing (`AdminCardGrid` + `AdminEntityCard` with #image/#badges/#stats/#actions) → Pinia edit store (`useEditableState`) → Edit page (`EditLayout` + `useEditState` from `_shared/`) → Config form (`AdminConfigPanel` + FormRenderer + `StickyButtonGroup`). Delete protection via `getDeleteProtection()`. Smart dirty detection: `useEditState` reads `originalData` from `store.toSnapshot()`, NOT composable.

**Admin list pattern** (donations, donors, subscriptions): `AdminListPage` + `DataTable` + `AdminFilterSheet`. Cross-entity filtering: `useEntityDataService` + `buildCustomFieldSchema` + `withCustomFieldEvaluators`.

**Form-builder for ALL forms**: Use `defineForm()`, field constructors, `FormRenderer`. Read `app/features/_library/form-builder/README.md` first. NON-NEGOTIABLE.

**`_library/` is sacred**: `form-builder` and `custom-fields` must NEVER contain donation-specific logic. Read READMEs first: `app/features/_library/form-builder/README.md`, `app/features/_library/custom-fields/README.md`.

**Admin previews**: Populate real Pinia stores with sample data, render real donor components. Never inject preview context into donor components.

**v-html sanitization**: ALL `v-html` → `sanitizeRichText()` from `~/features/_library/form-builder/utils/sanitize-html.ts`. Templates with variables → `processTemplateRichText()` from `~/features/templates/admin/utils/template-rich-text.ts`.

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

Use glob/grep to discover files, stores, composables, and pages — they are not enumerated here.

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
23. `wrapper.vm as Record<string, any>` with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` to access Vue component internals in tests

<!-- end continuous learning notes -->

## Code Rules

1. **PLAN FIRST**: Present 3+ options with 1-line desc + star rating (★) during planning. Questions only during planning, never mid-implementation.
2. **INVESTIGATE + FOLLOW PATTERNS**: Search codebase for similar patterns before writing code. Match conventions exactly.
3. **FORM-BUILDER FOR ALL FORMS**: Use `defineForm()`, field constructors, `FormRenderer`. Read README first. NON-NEGOTIABLE.
4. **`_library/` IS SACRED**: No donation logic in form-builder or custom-fields.
5. **TESTS UNCOVER BUGS**: If a test fails on sensible assertions, STOP and report — don't change test to match broken behavior.
6. **DEFER FORMATTING**: Batch at end: `pnpm format:fix; pnpm lint:fix; pnpm typecheck` (up to 60s).
7. **SUMMARIES + MEMORY**: Brief updates after each answer. End with conventional commit message. After tasks: check if structure changed (→ `/update-project-summary`), if learned something durable (→ update CL), if data models changed (→ update Supabase docs). Keep CL bullets ≤1 line, never duplicate — merge or clarify.
8. **COMMITS**: Short conventional commits. Check `git --no-pager diff --staged` first. No "Authored by Anthropic" line.

## Superpowers Overrides

- **No auto-commits**: NEVER commit automatically. Only commit when I explicitly ask.
- **No worktrees**: NEVER use git worktrees. Work directly on the current branch.
