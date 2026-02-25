---
paths:
  - "app/features/donation-form/**"
---

# Donation Form Feature

Multi-step donation wizard with 13 sub-features. Follows vertical slice architecture.

## Key files

- **Admin config store:** `shared/stores/formConfig.ts` — flat admin configuration for all form settings
- **Donor state store:** `donor/stores/donationForm.ts` — runtime donation state (step, amounts, frequencies, donor info)
- **Shared types:** `shared/types.ts` — FormSettings, FrequencySettings, DonationAmountsSettings, PresetAmount
- **Wizard entry:** `donor/DonationFlowWizard.vue`
- **Reusable forms:** `shared/forms/address-form.ts` (country-specific), `shared/forms/optional-message-field.ts`

## Sub-features (in `features/`)

contact-consent, cover-costs, custom-fields, donor-info, entry-fields, gift-aid, impact-boost, impact-cart, product, product-selector, shipping-notice, terms, tribute

Each sub-feature follows the same `admin/` + `donor/` split.

## Patterns

- Admin forms use `useAdminConfigForm()` composable for store-to-form binding
- Donor composables flatten store data for custom field context evaluation
- Currency handled via `shared/composables/useCurrency.ts` and `useDonationCurrencies.ts`
- Impact cart store (`features/impact-cart/donor/stores/impactCart.ts`) manages cart items by frequency
