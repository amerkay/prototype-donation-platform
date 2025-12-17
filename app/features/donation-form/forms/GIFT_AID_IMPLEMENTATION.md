# Gift Aid Form Implementation - Step 3

This document describes the implementation of Step 3 (Gift Aid consent form) for the donation flow, including all enhancements made to the form-builder system.

## Overview

Step 3 collects Gift Aid consent (UK donors only), home address, email preferences, and terms acceptance. The form demonstrates advanced form-builder features including:

- **Conditional visibility** based on currency (GBP)
- **Reusable address fields** with dynamic prefixing
- **Address reuse logic** (copy from shipping address)
- **Rich content cards** with images and HTML
- **Dynamic descriptions** based on form state

## File Structure

```
app/features/donation-form/forms/
├── address-form.ts          # Enhanced with createAddressFields() factory
├── gift-aid-form.ts         # NEW - Step 3 form definition
└── message-fields.ts        # Existing reusable pattern

app/features/form-builder/
├── form-builder-types.ts    # Enhanced CardFieldMeta
└── fields/
    └── FormFieldCard.vue    # Enhanced with image + content support
```

## Changes Made

### 1. Enhanced Card Field Component

**File**: `app/features/form-builder/form-builder-types.ts`

Added new properties to `CardFieldMeta`:

```typescript
export interface CardFieldMeta extends BaseFieldMeta {
  type: 'card'
  imageSrc?: string // Path to image (e.g., '/imgs/gift-aid.svg')
  imageAlt?: string // Alt text for accessibility
  imageClass?: string // Tailwind classes for image styling
  content?: string // Rich HTML content (sanitized)
}
```

**File**: `app/features/form-builder/fields/FormFieldCard.vue`

Enhanced to support:

- Optional image display above content
- Rich HTML content via `v-html`
- Slot-based custom content (highest priority)
- Backward compatible with existing plain text cards

**Usage Example**:

```typescript
giftAidInfo: {
  type: 'card',
  label: 'Boost Your Donation by 25%',
  imageSrc: '/imgs/gift-aid.svg',
  imageAlt: 'Gift Aid',
  imageClass: 'h-16 w-auto mb-4',
  content: `
    <p class="mb-3">Gift Aid enables us to reclaim 25p for every £1 donated...</p>
    <ul class="list-disc list-inside">
      <li>Be a UK taxpayer</li>
      <li>Have paid sufficient tax</li>
    </ul>
  `
}
```

### 2. Address Fields Factory Function

**File**: `app/features/donation-form/forms/address-form.ts`

Created `createAddressFields()` factory for reusable address collection:

```typescript
export function createAddressFields(
  prefix = '', // e.g., 'homeAddress', 'giftAidAddress'
  visibilityCondition?: Function, // Optional parent visibility
  autocompleteSection = 'shipping' // HTML autocomplete attribute
): FieldMetaMap
```

**Features**:

- Dynamic field path prefixing (e.g., `homeAddress.address1`)
- LocationIQ autocomplete with prefix-aware API calls
- Manual entry fallback
- Conditional visibility support
- Customizable autocomplete attributes

**Helper Functions Updated**:

1. `populateAddressFields(parsed, setValue, prefix = '')`
   - Accepts optional prefix for nested paths
   - Updates all `setValue()` calls dynamically

2. `fetchAddressSuggestions(query, formValues, prefix = '')`
   - Extracts country from correct nested path
   - Prefix-aware form value access

3. `handleAddressSelection(value, allValues, setValue, prefix = '')`
   - Passes prefix through to populate function

**Refactored** `addressFormSection` to use factory internally:

```typescript
export const addressFormSection: ConfigSectionDef = {
  id: 'address',
  title: 'Address',
  fields: createAddressFields() // No prefix = root level
}
```

**Usage Examples**:

```typescript
// Root level (backward compatible)
const fields = createAddressFields()

// Nested under field-group
homeAddress: {
  type: 'field-group',
  label: 'Home Address',
  fields: createAddressFields('homeAddress', undefined, 'billing')
}

// With visibility condition
const fields = createAddressFields(
  'giftAidAddress',
  (values) => values.giftAidConsent === true
)
```

### 3. Gift Aid Form (Step 3)

**File**: `app/features/donation-form/forms/gift-aid-form.ts`

Complete implementation with:

#### Gift Aid Info Card (GBP only)

```typescript
giftAidInfo: {
  type: 'card',
  label: 'Boost Your Donation by 25%',
  imageSrc: '/imgs/gift-aid.svg',
  content: '<p>Gift Aid information...</p>',
  visibleWhen: (values) => values.currency === 'GBP'
}
```

#### Gift Aid Consent Toggle

```typescript
giftAidConsent: {
  type: 'toggle',
  label: 'Yes, I want to Gift Aid my donation',
  description: 'I am a UK taxpayer and understand...',
  visibleWhen: (values) => values.currency === 'GBP'
}
```

#### Smart Address Reuse

```typescript
useSameAsShipping: {
  type: 'toggle',
  label: 'Use same as shipping address',
  description: (values) => {
    const shippingAddress = formatAddress(values, 'shippingAddress')
    return `Your shipping address: ${shippingAddress}`
  },
  visibleWhen: (values) =>
    values.giftAidConsent === true &&
    !!(values['shippingAddress.address1']),
  onChange: (value, allValues, setValue) => {
    if (value === true) {
      // Copy all shipping fields to homeAddress
      copyAddressFields('shippingAddress', 'homeAddress', allValues, setValue)
    }
  }
}
```

#### Home Address Collection

```typescript
homeAddress: {
  type: 'field-group',
  label: 'Home Address',
  description: 'Required by HMRC for Gift Aid claims',
  visibleWhen: (values) =>
    values.giftAidConsent === true &&
    values.useSameAsShipping !== true,
  fields: createAddressFields('homeAddress', undefined, 'billing')
}
```

#### Email & Terms

```typescript
joinEmailList: {
  type: 'toggle',
  label: 'Join our email list',
  optional: true
},
acceptTerms: {
  type: 'toggle',
  label: 'I accept the terms and conditions',
  rules: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions'
  })
}
```

## Helper Functions

### formatAddress()

Formats address fields for display in truncated form:

```typescript
function formatAddress(values: Record<string, unknown>, prefix = ''): string {
  // Returns: "123 Main St, Apt 4B... SW1A 1AA"
  // Or: "No address on file"
}
```

## Form Flow

```
1. Currency = GBP?
   ├─ YES → Show Gift Aid info card + consent toggle
   └─ NO  → Skip to email/terms

2. Gift Aid consent given?
   ├─ YES → Check for shipping address
   │        ├─ Has shipping → Show "Use same" toggle
   │        │   ├─ Toggled ON  → Copy address, hide form
   │        │   └─ Toggled OFF → Show home address form
   │        └─ No shipping → Show home address form
   └─ NO  → Skip to email/terms

3. Email list opt-in (optional)

4. Accept terms (required)
```

## Integration Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { giftAidFormSection } from '~/features/donation-form/forms/gift-aid-form'

const formData = ref({
  currency: 'GBP', // Set from Step 1
  shippingAddress: {
    /* populated from Step 2 */
  }
})

function handleSubmit() {
  console.log('Gift Aid data:', formData.value)
  // Process: giftAidConsent, homeAddress, joinEmailList, acceptTerms
}
</script>

<template>
  <FormRenderer v-model="formData" :section="giftAidFormSection" @submit="handleSubmit" />
</template>
```

## Key Features Demonstrated

### 1. **Prefix-Aware Field Paths**

- All address fields properly namespaced
- `homeAddress.address1`, `homeAddress.countyPostcode.postcode`
- LocationIQ callbacks use correct paths

### 2. **Cross-Field Dependencies**

- Address visibility depends on consent toggle
- "Use same" toggle depends on shipping address existence
- onChange can copy values between field groups

### 3. **Dynamic Descriptions**

- Show formatted shipping address in toggle description
- Update in real-time as user types

### 4. **Conditional Validation**

- Address fields only required when Gift Aid consent given
- Terms must be explicitly accepted (boolean refine)

### 5. **Rich Content Display**

- Gift Aid logo + formatted legal text
- Multi-paragraph HTML with proper styling
- Lists, bold text, and custom classes

## Testing Checklist

- [ ] GBP currency shows Gift Aid card with logo
- [ ] Non-GBP currency hides Gift Aid section
- [ ] Gift Aid consent shows address options
- [ ] "Use same as shipping" correctly copies all fields
- [ ] Home address form validates when visible
- [ ] LocationIQ autocomplete works with `homeAddress` prefix
- [ ] Manual entry works with nested paths
- [ ] Email opt-in is optional
- [ ] Terms acceptance is required
- [ ] Form submission includes all fields

## Assets Required

Place Gift Aid logo at: `/public/imgs/gift-aid.svg`

## Future Enhancements

1. **Link Support in Card Content**
   - Add `links` prop to CardFieldMeta for clickable links
   - Example: Privacy Policy, Terms of Service

2. **Address Validation**
   - Post-populate validation against Royal Mail API
   - Show warning for non-standard addresses

3. **Gift Aid Declaration**
   - Add "past 4 years" checkbox
   - Generate PDF declaration for records

4. **Multi-Language Support**
   - Translate Gift Aid text based on locale
   - Support Scottish/Welsh charity numbers

## Related Files

- Form builder types: `app/features/form-builder/form-builder-types.ts`
- Address factory: `app/features/donation-form/forms/address-form.ts`
- Gift Aid form: `app/features/donation-form/forms/gift-aid-form.ts`
- Card component: `app/features/form-builder/fields/FormFieldCard.vue`
