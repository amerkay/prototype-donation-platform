---
paths:
  - "app/features/donation-form/**"
---

# Donation Form Feature

Multi-step donation wizard with 13 sub-features.

## Key files

- **Admin config store:** `shared/stores/formConfig.ts`
- **Donor state store:** `donor/stores/donationForm.ts` (step, amounts, frequencies, donor info)
- **Types:** `shared/types.ts` — FormType (`donation`|`registration`), FormSettings, FormTypeLabels
- **Form type labels:** `shared/composables/useFormTypeLabels.ts` — per-type terminology overrides
- **Wizard entry:** `donor/DonationFlowWizard.vue`
- **Reusable forms:** `shared/forms/address-form.ts` (country-specific), `shared/forms/optional-message-field.ts`

## Sub-features (in `features/`)

contact-consent, cover-costs, custom-fields, donor-info, entry-fields, gift-aid, impact-boost, impact-cart, product, product-selector, shipping-notice, terms, tribute

Each sub-feature follows the `admin/` + `donor/` split.

## Patterns

- Admin forms use `useAdminConfigForm()` for store-to-form binding
- Donor composables flatten store data for custom field context evaluation
- Currency: `shared/composables/useCurrency.ts` and `useDonationCurrencies.ts`
- Impact cart store (`features/impact-cart/donor/stores/impactCart.ts`) manages cart items by frequency
