---
paths:
  - "app/features/settings/**"
  - "app/pages/admin/settings/**"
---

# Settings Feature

Organization-level configuration across 11 settings pages.

## Key files

- **Store factory:** `_admin/composables/defineSettingsStore.ts` — eliminates boilerplate for simple stores
- **Currency guards:** `admin/composables/useCurrencyGuards.ts` — `findFormsUsingCurrencies`, `stripCurrenciesFromForms`
- **Types:** `admin/types.ts` — TeamMember (4-tier roles), GeneralSettings, BrandingSettings, CharitySettings, etc.

## Role hierarchy (owner > admin > developer > member)

| Role | Permissions |
|------|-------------|
| member | View/edit campaigns, forms, products, templates |
| developer | member + API keys, webhooks (does NOT inherit admin) |
| admin | member + export, settings (general/branding/charity/currency), team management |
| owner | admin + payments, billing, delete org, transfer ownership |

## Patterns

- **Currency removal** uses two-tier guards: prevents if base currency, warns if only in enabled list
- **Charity settings** use tabbed per-currency overrides (name, reg#, phone, email, address) via `$storePath` deep writes
