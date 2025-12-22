# Form Naming Convention

## Overview

The donation form follows a consistent pattern for organizing form sections and store keys across all steps.

## Naming Pattern

### Step 2: Donor Information & Shipping

**Form Sections (separate)**:

- `donor-info` - Form section ID in `donor-info-form.ts`
- `address` - Form section ID in `address-form.ts` (used for shipping)

**Store Keys**:

- `donorInfo` - Camel case for donor information data
- `shipping` - Camel case for shipping address data

**Component Variables**:

- `donorInfoSection` - Computed ref in `DonationFormStep2.vue`
- `shippingSection` - Computed ref in `DonationFormStep2.vue`

**File Structure**:

```
steps/step2/
  ├── DonationFormStep2.vue
  └── forms/
      └── donor-info-form.ts (exports donorInfoFormSection)
forms/
  └── address-form.ts (exports addressFormSection & createAddressFields)
```

### Step 3: Gift Aid, Cover Costs, Preferences

**Form Sections (separate)**:

- `gift-aid` - Form section ID in `gift-aid-form.ts`
- `preferences` - Form section ID in `preferences-form.ts`

**Store Keys**:

- `giftAid` - Camel case for Gift Aid data and cover costs
- `preferences` - Camel case for email opt-in and terms acceptance

**Component Variables**:

- `giftAidSection` - Computed ref in `DonationFormStep3.vue`
- `preferencesSection` - Computed ref in `DonationFormStep3.vue`

**File Structure**:

```
steps/step3/
  ├── DonationFormStep3.vue
  └── forms/
      ├── gift-aid-form.ts (exports giftAidFormSection)
      └── preferences-form.ts (exports preferencesFormSection)
forms/
  ├── gift-aid-fields.ts (exports createGiftAidFields)
  ├── email-opt-in-field.ts (exports createEmailOptInField)
  └── terms-acceptance-field.ts (exports createTermsAcceptanceField)
```

## Rationale

### Why Both Steps Use Multiple Sections

Both steps separate concerns into logical groupings that can be rendered independently:

**Step 2:**

- **Donor Info**: Always required - contact information
- **Shipping Address**: Conditionally required - only when physical items need shipping

**Step 3:**

- **Gift Aid**: Conditionally visible - UK-specific tax incentive with address and cover costs
- **Preferences**: Always visible - universal final preferences (email, terms)

Benefits of separation:

1. Each section can be conditionally rendered independently
2. Clear separation of concerns (contact vs. delivery, tax vs. preferences)
3. Sections can be validated independently
4. Better code organization and maintainability
5. Consistent pattern across all steps

### Form Section Files vs. Helper Functions

**Full Section Exports** (in `steps/stepN/forms/`):

- Export complete `FormDef` objects with id, title, fields
- Examples: `donorInfoFormSection`, `giftAidFormSection`, `preferencesFormSection`
- Used directly in FormRenderer components
- Specific to a single step/section

**Helper Functions** (in root `forms/`):

- Export functions that return `FieldMetaMap`
- Examples: `createAddressFields()`, `createGiftAidFields()`, `createEmailOptInField()`
- Promote reusability across different contexts
- Can be composed into multiple section definitions

## Data Storage Structure

```typescript
// Pinia store structure
formSections: {
  donorInfo: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    message?: string
    anonymous?: boolean
    isIncludeMessage?: boolean
  },
  shipping: {
    address1: string
    address2?: string
    city: string
    regionPostcode: { region: string, postcode: string }
    country: string
  },
  giftAid: {
    // Gift Aid fields (UK donors only)
    giftAidConsent?: boolean
    giftAidInfo?: any // Card field (informational)
    homeAddress?: {
      address1: string
      address2?: string
      city: string
      regionPostcode: { region: string, postcode: string }
      country: 'GB' // Always GB for Gift Aid
    }
    reuseShippingAddress?: boolean

    // Cover costs (dynamic percentage or fixed amount)
    coverFeesPercentage?: number  // 0-30 (for donations >= 10 GBP)
    coverFeesAmount?: number      // 0-5 (for donations < 10 GBP)
  },
  preferences: {
    // Email opt-in
    joinEmailList?: boolean

    // Terms acceptance (required)
    acceptTerms: boolean
  }
}
```

## Consistency Benefits

1. **Predictable**: Both steps use multiple form sections with clear logical grouping
2. **Maintainable**: Easy to add/remove sections following established pattern
3. **DRY**: Helper functions (`create*Fields()`) promote reusability across sections
4. **Type-safe**: TypeScript can infer types from store structure
5. **Debuggable**: Clear hierarchy in Vue DevTools and Pinia DevTools
6. **Modular**: Each form section is self-contained with id, title, fields
7. **Flexible**: Sections can be conditionally rendered based on context
8. **Scalable**: Pattern can be extended to Step 4, Step 5, etc.

## Component Rendering Pattern

Both Step 2 and Step 3 follow the same rendering pattern:

```vue
<template>
  <div>
    <!-- Section 1 (always visible) -->
    <div class="rounded-lg border border-transparent px-4 py-6 bg-background/40">
      <FormRenderer
        ref="section1Ref"
        v-model="section1Data"
        :section="section1FormSection"
        :keep-values-on-unmount="true"
      />
    </div>

    <!-- Section 2 (conditional) -->
    <div
      v-if="showSection2"
      class="rounded-lg border border-transparent px-4 py-6 bg-background/40"
    >
      <FormRenderer
        ref="section2Ref"
        v-model="section2Data"
        :section="section2FormSection"
        :keep-values-on-unmount="true"
      />
    </div>

    <!-- Navigation -->
    <NextButton :form-refs="formRefsToValidate" @click="handleNext"> Next </NextButton>
  </div>
</template>
```

This ensures consistent UX and validation patterns across all steps.
