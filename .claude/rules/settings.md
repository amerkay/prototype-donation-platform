---
paths:
  - "app/features/settings/**"
  - "app/pages/admin/settings/**"
---

# Settings Feature

## To add a new settings page

1. Define the store using `defineSettingsStore` from `_admin/composables/defineSettingsStore.ts`
2. Add types to `admin/types.ts` (e.g., `GeneralSettings`, `BrandingSettings`, `CharitySettings`)
3. Use `StickyButtonGroup` for save/discard — mandatory for all settings pages
4. Build the form with `defineForm()` + `FormRenderer`

## To add a permission-gated action

Check the 4-tier role hierarchy (each inherits from lower tiers except where noted):

| Role | Can access |
|------|-----------|
| member | View/edit campaigns, forms, products, templates |
| developer | member + API keys, webhooks (does NOT inherit admin) |
| admin | member + export, settings (general/branding/charity/currency), team management |
| owner | admin + payments, billing, delete org, transfer ownership |

## To modify currency settings

1. Currency removal has two-tier guards in `admin/composables/useCurrencyGuards.ts`:
   - **Blocks** removal if it's the base currency
   - **Warns** if the currency is only in the enabled list
2. Always use `findFormsUsingCurrencies` to check form usage (`enabledCurrencies`/`baseDefaultCurrency`) before saving
3. Use `stripCurrenciesFromForms` to clean up form references when removing

## To modify charity settings

Charity settings use tabbed per-currency overrides (name, reg#, phone, email, address) via `$storePath` deep writes.
