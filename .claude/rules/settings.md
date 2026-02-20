---
paths:
  - "app/features/settings/**"
  - "app/pages/admin/settings/**"
---

# Settings Feature

Organization-level configuration across 9 settings pages. Uses `defineSettingsStore` helper for simple stores.

## Key files

- **Store factory:** `_admin/composables/defineSettingsStore.ts` — generic helper for simple settings (eliminates ~250 LOC boilerplate)
- **Simple stores (using factory):** `admin/stores/generalSettings.ts`, `brandingSettings.ts`, `socialSharingSettings.ts`, `receiptTemplate.ts`
- **Complex stores (custom logic):** `charitySettings.ts` (per-currency tabs), `currencySettings.ts` (currency guards), `apiSettings.ts`, `teamSettings.ts`, `billingSettings.ts`, `paymentSettings.ts`
- **Types:** `admin/types.ts` — TeamMember (4-tier roles), GeneralSettings, BrandingSettings, CharitySettings, etc.
- **Currency guards:** `admin/composables/useCurrencyGuards.ts` — two-tier removal protection (findFormsUsingCurrencies, stripCurrenciesFromForms)

## Role hierarchy (owner > admin > developer > member)

| Role | Permissions |
|------|-------------|
| member | View/edit campaigns, forms, products, templates |
| developer | member + API keys, webhooks (does NOT inherit admin) |
| admin | member + export, settings (general/branding/charity/currency), team management |
| owner | admin + payments, billing, delete org, transfer ownership |

See `app/pages/admin/settings/team.vue` for role UI (icons: Crown, Shield, Code, User).

## Patterns

- **Simple stores use `defineSettingsStore`** — 4 stores collapsed to ~8 LOC each (generalSettings, brandingSettings, socialSharingSettings, receiptTemplate)
- **Complex stores** have custom methods and can't use factory (charity tabs, currency guards, array CRUD, payment connect/disconnect)
- **Supabase migration**: All stores marked with `TODO-SUPABASE` comments. Schema maps to 4 grouped tables: `org_config`, `org_identity`, `org_integrations`, `org_financial` (see `app/sample-api-responses/SUPABASE_SCHEMA_DRAFT.md`)
- **Currency removal** uses two-tier guards: prevents removal if base currency, warns if only in enabled list
- **Charity settings** use tabbed per-currency overrides (name, reg#, phone, email, address) via `$storePath` deep writes
