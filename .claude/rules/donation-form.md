---
paths:
  - "app/features/donation-form/**"
---

# Donation Form Feature

## To add a new donation form sub-feature

1. Create a directory under `features/` with `admin/` and `donor/` subdirectories
2. Admin config: use `useAdminConfigForm()` for store-to-form binding with the edit store at `shared/stores/formConfig.ts`
3. Donor state: read/write through the donor store at `donor/stores/donationForm.ts` (manages step, amounts, frequencies, donor info)
4. Existing sub-features for reference: contact-consent, cover-costs, custom-fields, donor-info, entry-fields, gift-aid, impact-boost, impact-cart, product, product-selector, shipping-notice, terms, tribute

## To modify the donor checkout flow

1. The wizard entry point is `donor/DonationFlowWizard.vue`
2. Form type (`donation` | `registration`) determines available steps — see `shared/types.ts` for `FormType`, `FormSettings`, `FormTypeLabels`
3. Per-type terminology overrides live in `shared/composables/useFormTypeLabels.ts`

## To work with shared form definitions

- Address form (country-specific): `shared/forms/address-form.ts`
- Optional message field: `shared/forms/optional-message-field.ts`

## To work with currency and cart

- Currency composables: `shared/composables/useCurrency.ts` and `useDonationCurrencies.ts`
- Impact cart (manages items by frequency): `features/impact-cart/donor/stores/impactCart.ts`
- Donor composables flatten store data for custom field context evaluation
