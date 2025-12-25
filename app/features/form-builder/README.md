# Form Builder

Build type-safe forms with minimal code. Define structure in config, get validation and conditional logic for free.

## Overview

**What you write:**

```typescript
const formSection: FormDef = {
  id: 'contact',
  fields: {
    name: { type: 'text', label: 'Name', rules: z.string().min(2) },
    email: { type: 'text', label: 'Email', rules: z.string().email() }
  }
}
```

**What you get:**

```vue
<FormRenderer :section="formSection" v-model="data" @submit="handleSubmit" />
```

Full validation, error messages, accessibility, and reactive state management. No form boilerplate.

## Essential Fields

The workhorses you'll use daily.

### text

Single-line text input.

```typescript
email: {
  type: 'text',
  label: 'Email Address',
  placeholder: 'john@example.com',
  autocomplete: 'email',
  rules: z.string().email('Invalid email')
}
```

**Props:** `placeholder`, `autocomplete`, `maxLength`

### textarea

Multi-line text input.

```typescript
message: {
  type: 'textarea',
  label: 'Your Message',
  rows: 5,
  maxLength: 500,
  rules: z.string().min(10)
}
```

**Props:** `rows`, `maxLength`

### number

Number input with increment/decrement buttons.

```typescript
quantity: {
  type: 'number',
  label: 'Quantity',
  min: 1,
  max: 100,
  step: 1,
  rules: z.number().min(1)
}
```

**Props:** `min`, `max`, `step`

### toggle

Boolean switch. Perfect for yes/no options.

```typescript
subscribe: {
  type: 'toggle',
  label: 'Subscribe to newsletter',
  description: 'Get weekly updates',
  optional: true
}
```

**Note:** Toggles don't need `rules` unless you require them to be true.

## Selection Fields

When users pick from options.

### select

Native HTML dropdown. Fast and familiar.

```typescript
country: {
  type: 'select',
  label: 'Country',
  options: [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' }
  ],
  rules: z.string().min(1, 'Please select a country')
}
```

**Props:** `options: Array<{ value: string, label: string }>`

### combobox

Searchable select with single or multiple selection. Better UX for long lists.

```typescript
tags: {
  type: 'combobox',
  label: 'Tags',
  placeholder: 'Select tags',
  searchPlaceholder: 'Search...',
  multiple: true,
  options: [
    { value: 'bug', label: 'Bug' },
    { value: 'feature', label: 'Feature' },
    { value: 'docs', label: 'Documentation' }
  ]
}
```

**Props:** `options`, `multiple`, `searchPlaceholder`  
**Dynamic options:** Use a function for `options: (values) => computedOptions`

### autocomplete

Async typeahead with debounced search. For remote data sources.

```typescript
city: {
  type: 'autocomplete',
  label: 'City',
  searchPlaceholder: 'Type to search cities...',
  loadOptions: async (query) => {
    const res = await fetch(`/api/cities?q=${query}`)
    const cities = await res.json()
    return cities.map(c => ({
      value: c.id,
      label: c.name,
      data: c  // Store full object for later use
    }))
  },
  staticOptions: [
    { value: 'nyc', label: 'New York', data: { ... } }
  ],
  onChange: (selected, allValues, setValue) => {
    // Access the full city object via selected.data
    const cityData = selected?.data
    if (cityData) {
      setValue('timezone', cityData.timezone)
    }
  }
}
```

**Props:** `loadOptions: (query: string) => Promise<AutocompleteOption[]>`, `staticOptions`, `debounceMs`, `minQueryLength`

**AutocompleteOption structure:** `{ value: string | number, label: string, data?: any }`  
The `data` property stores the full object, accessible in `onChange` callbacks.

### radio-group

Radio buttons for mutually exclusive choices.

```typescript
plan: {
  type: 'radio-group',
  label: 'Choose a plan',
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro - $10/mo' }
  ],
  orientation: 'vertical',
  rules: z.enum(['free', 'pro'])
}
```

**Props:** `options`, `orientation: 'horizontal' | 'vertical'`

## Specialized Fields

For specific use cases.

### currency

Number input with currency symbol.

```typescript
amount: {
  type: 'currency',
  label: 'Donation Amount',
  currencySymbol: '$',
  min: 1,
  step: 1,
  rules: z.number().min(1)
}
```

**Dynamic currency symbol:**

```typescript
fields: {
  currency: {
    type: 'select',
    label: 'Currency',
    options: [
      { value: 'USD', label: 'US Dollar' },
      { value: 'GBP', label: 'British Pound' },
      { value: 'EUR', label: 'Euro' }
    ]
  },
  amount: {
    type: 'currency',
    label: 'Amount',
    currencySymbol: (values) => {
      const symbols = { USD: '$', GBP: '£', EUR: '€' }
      return symbols[values.currency as string] || '$'
    },
    min: 1
  }
}
```

**Props:** `currencySymbol`, `min`, `max`, `step`  
**Dynamic symbol:** `currencySymbol` accepts a function that receives form values

### slider

Range slider for selecting values on a scale.

```typescript
volume: {
  type: 'slider',
  label: 'Volume',
  min: 0,
  max: 100,
  step: 1,
  formatValue: (val) => `${val}%`
}
```

**Advanced slider with dynamic formatting:**

```typescript
coverCosts: {
  type: 'slider',
  label: 'Cover Transaction Costs',
  min: (values) => values.donationAmount >= 100 ? 0 : 0,
  max: (values) => values.donationAmount >= 100 ? 15 : 5.50,
  step: (values) => values.donationAmount >= 100 ? 1 : 0.5,
  formatValue: (value, formValues) => {
    // Show percentage for large donations, currency for small
    return formValues?.donationAmount >= 100 ? `${value}%` : `$${value.toFixed(2)}`
  },
  showMinMax: true,  // Display min/max labels below slider
  minMaxFormatter: (value, formValues) => `${value}%`,  // Custom min/max format
  prefix: 'Add',     // Text before value label
  suffix: 'extra'    // Text after value label
}
```

**Props:** `min`, `max`, `step`, `formatValue`, `showMinMax`, `minMaxFormatter`, `prefix`, `suffix`  
**Dynamic props:** All numeric props (`min`, `max`, `step`) accept functions for conditional behavior

### emoji

Single emoji picker. Great for reactions or icons.

```typescript
reaction: {
  type: 'emoji',
  label: 'How do you feel?',
  placeholder: '😊',
  maxLength: 2
}
```

**Props:** `maxLength`

### card

Display-only card. For instructions or context.

```typescript
info: {
  type: 'card',
  label: 'Important Notice',
  description: 'Your data is encrypted and never shared.',
  imageSrc: '/icon-shield.svg',
  imageAlt: 'Security',
  imageClass: 'w-16 h-16 mb-4'
}
```

**With rich HTML content:**

```typescript
tips: {
  type: 'card',
  label: 'Pro Tips',
  content: '<ul><li>Use strong passwords</li><li>Enable 2FA</li></ul>'
}
```

**Props:** `label`, `description`, `content` (raw HTML), `imageSrc`, `imageAlt`, `imageClass`

**Custom content:** Card fields support slots for complete layout control. Use `FormField` component with custom template when needed.

### separator

Visual divider between fields.

```typescript
divider: {
  type: 'separator'
}
```

## Container Fields

Organize and group related fields.

### field-group

Group fields with shared layout. Values nest under the group name.

```typescript
address: {
  type: 'field-group',
  label: 'Shipping Address',
  class: 'grid grid-cols-2 gap-x-3',
  fields: {
    street: { type: 'text', label: 'Street' },
    city: { type: 'text', label: 'City' },
    zip: { type: 'text', label: 'ZIP' },
    country: { type: 'select', label: 'Country', options: [...] }
  }
}
```

**Result:** Form data is `{ address: { street: '...', city: '...', ... } }`

**Accessing nested values:**

```typescript
onChange: (value, allValues, setValue) => {
  const city = (allValues.address as Record<string, unknown>)?.city
  setValue('address.zip', '10001') // Use dot notation
}
```

#### Collapsible Groups

Accordion-style for admin panels or optional sections.

```typescript
advanced: {
  type: 'field-group',
  label: 'Advanced Options',
  collapsible: true,
  collapsibleDefaultOpen: false,
  badgeLabel: 'Optional',
  badgeVariant: 'secondary',
  fields: { /* ... */ }
}
```

**Props:** `collapsible`, `collapsibleDefaultOpen`, `badgeLabel`, `badgeVariant`

**Automatic error indicators:** When any child field has validation errors, collapsible groups automatically show a red error badge. The badge text changes to "X errors" (where X is the count). This helps users locate problems in collapsed sections.

### tabs

Organize fields into tabbed sections. Like field-groups, but with tab navigation.

```typescript
contact: {
  type: 'tabs',
  label: 'Contact Preferences',
  defaultValue: 'email',  // Initial active tab
  tabs: [
    {
      value: 'email',
      label: 'Email',
      badgeLabel: 'Primary',  // Optional badge on tab
      fields: {
        emailAddress: { type: 'text', label: 'Email' },
        emailFrequency: { type: 'select', label: 'Frequency', options: [...] }
      }
    },
    {
      value: 'sms',
      label: 'SMS',
      fields: {
        phone: { type: 'text', label: 'Phone Number' }
      }
    }
  ]
}
```

**Result:** Form data is `{ contact: { emailAddress: '...', emailFrequency: '...', phone: '...' } }`

**Props:** `tabs: TabDefinition[]`, `defaultValue`, `tabsListClass`, `badgeLabel` (per tab), `badgeVariant` (per tab)

**Automatic error indicators:** Tabs with validation errors automatically show a red error badge on the tab trigger. This helps users identify which tabs need attention without switching between them.

### array

Dynamic list of items. Users can add/remove entries. **Supports drag-and-drop reordering.**

```typescript
skills: {
  type: 'array',
  label: 'Skills',
  addButtonText: 'Add Skill',
  itemField: {
    type: 'text',
    placeholder: 'e.g., JavaScript'
  }
}
```

**Result:** Form data is `{ skills: ['JavaScript', 'TypeScript', ...] }`

**Complex items:**

```typescript
contacts: {
  type: 'array',
  label: 'Emergency Contacts',
  addButtonText: 'Add Contact',
  removeButtonText: 'Remove',  // Optional custom remove button text
  itemField: {
    type: 'field-group',
    class: 'grid grid-cols-2 gap-x-3',
    fields: {
      name: { type: 'text', label: 'Name' },
      phone: { type: 'text', label: 'Phone' }
    }
  }
}
```

**Result:** `{ contacts: [{ name: 'Jane', phone: '555-0100' }, ...] }`

**Props:** `itemField`, `addButtonText`, `removeButtonText`, `class` (applied to grid container)  
**Note:** Drag handles appear automatically. Items can be reordered by dragging.

## Making Forms Interactive

The real power: smart forms that adapt to user input.

### Conditional Visibility

Show/hide fields based on form values. Hidden fields skip validation.

```typescript
fields: {
  accountType: {
    type: 'radio-group',
    options: [
      { value: 'personal', label: 'Personal' },
      { value: 'business', label: 'Business' }
    ]
  },
  companyName: {
    type: 'text',
    label: 'Company Name',
    visibleWhen: (values) => values.accountType === 'business',
    rules: z.string().min(1, 'Required')
  },
  taxId: {
    type: 'text',
    label: 'Tax ID',
    visibleWhen: (values) => values.accountType === 'business',
    rules: z.string().regex(/^\d{2}-\d{7}$/)
  }
}
```

The `visibleWhen` function receives all form values. Return `true` to show, `false` to hide.

### Dynamic Validation

Validation rules that change based on form state.

```typescript
phone: {
  type: 'text',
  label: 'Phone',
  description: (values) =>
    values.country === 'US'
      ? 'Format: (555) 123-4567'
      : 'Include your country code',
  rules: (values) => {
    if (values.country === 'US') {
      return z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid US phone format')
    }
    return z.string().min(1, 'Phone is required')
  }
}
```

**Dynamic text:** All text fields (`label`, `description`, `placeholder`) accept functions.

### onChange Callbacks

React to field changes. Update other fields or trigger side effects.

```typescript
sendEmail: {
  type: 'toggle',
  label: 'Send confirmation email',
  onChange: (value, allValues, setValue) => {
    if (!value) {
      setValue('emailAddress', '')  // Clear email when disabled
    }
  }
},
emailAddress: {
  type: 'text',
  label: 'Email Address',
  visibleWhen: (values) => values.sendEmail === true,
  rules: (values) =>
    values.sendEmail ? z.string().email() : z.string().optional()
}
```

**Signature:** `onChange: (newValue, allFormValues, setFieldValue) => void`

**Use sparingly.** onChange is powerful but can make forms hard to reason about. Prefer `visibleWhen` and dynamic `rules` for most cases.

## Reusable Field Sets

Extract repeated field patterns into factory functions.

### Creating a Field Set

```typescript
// app/features/forms/address-fields.ts
import type { FieldMetaMap } from '~/features/form-builder/form-builder-types'

export function createAddressFields(autocompleteSection = 'shipping'): FieldMetaMap {
  return {
    street: {
      type: 'text',
      label: 'Street Address',
      autocomplete: `${autocompleteSection} address-line1`
    },
    city: {
      type: 'text',
      label: 'City',
      autocomplete: `${autocompleteSection} address-level2`
    },
    state: {
      type: 'text',
      label: 'State',
      autocomplete: `${autocompleteSection} address-level1`
    },
    zip: {
      type: 'text',
      label: 'ZIP Code',
      autocomplete: `${autocompleteSection} postal-code`
    }
  }
}
```

### Using Field Sets

**Spread into fields:**

```typescript
fields: {
  name: { type: 'text', label: 'Name' },
  ...createAddressFields()
}
```

**Or nest in a group:**

```typescript
fields: {
  shippingAddress: {
    type: 'field-group',
    label: 'Shipping Address',
    fields: createAddressFields('shipping')
  },
  billingAddress: {
    type: 'field-group',
    label: 'Billing Address',
    fields: createAddressFields('billing')
  }
}
```

**With visibility:**

```typescript
export function createMessageFields(
  condition?: (values: Record<string, unknown>) => boolean
): FieldMetaMap {
  return {
    includeMessage: {
      type: 'toggle',
      label: 'Include a message',
      visibleWhen: condition,
      optional: true
    },
    message: {
      type: 'textarea',
      label: 'Message',
      maxLength: 250,
      visibleWhen: (values) => {
        if (condition && !condition(values)) return false
        return values.includeMessage === true
      }
    }
  }
}
```

## API Reference

### FormRenderer

**Props:**

- `section: FormDef` – Form configuration object
- `modelValue: Record<string, unknown>` – Form values (use with `v-model`)
- `class?: string` – CSS classes applied to form element
- `keepValuesOnUnmount?: boolean` – Preserve form state when component unmounts (default: `false`)
- `validateOnMount?: boolean` – Validate all fields immediately on mount (default: `false`). Useful for edit forms with pre-filled data.

**Events:**

- `update:modelValue` – Emitted on any field change
- `submit` – Emitted when form is submitted (Enter key in text fields or manual `onSubmit()`)

**Exposed Properties:**

- `isValid` – Computed ref with current form validation state
- `onSubmit()` – Function to manually trigger form submission

**Example:**

```vue
<script setup lang="ts">
const formRef = ref<InstanceType<typeof FormRenderer>>()
const data = ref({})

function manualSubmit() {
  if (formRef.value?.isValid) {
    formRef.value.onSubmit()
  }
}
</script>

<template>
  <FormRenderer
    ref="formRef"
    :section="form"
    v-model="data"
    validate-on-mount
    @submit="handleSubmit"
  />
  <Button @click="manualSubmit">Submit</Button>
</template>
```

### FormDef

```typescript
interface FormDef {
  id: string // Unique form identifier
  title?: string // Form title
  description?: string // Form description
  fields: FieldMetaMap // Field definitions
  schema?: z.ZodTypeAny // Root-level Zod schema (rarely needed)
  defaultValue?: Record<string, unknown> // Initial form values
}
```

**About `schema`:** Each field defines its own validation via the `rules` property. The root `schema` is only needed for cross-field validation that involves multiple fields. For example:

```typescript
schema: z.object({
  password: z.string(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})
```

For most forms, field-level `rules` are sufficient.

### Common Field Properties

Every field type supports these:

```typescript
{
  label?: string | (values) => string
  description?: string | (values) => string
  placeholder?: string | (values) => string
  optional?: boolean                // Shows "(optional)" badge
  disabled?: boolean
  visibleWhen?: (values) => boolean
  rules?: z.ZodTypeAny | (values) => z.ZodTypeAny
  onChange?: (value, allValues, setValue) => void
  isNoSeparatorAfter?: boolean     // Skip separator after this field
  class?: string                   // CSS classes for input element
  labelClass?: string              // CSS classes for label
  descriptionClass?: string        // CSS classes for description
  autocomplete?: string            // HTML autocomplete attribute
}
```

### SetFieldValueFn

Used in `onChange` callbacks to update other fields.

```typescript
type SetFieldValueFn = (relativePath: string, value: unknown) => void
```

**Usage:**

```typescript
onChange: (value, allValues, setValue) => {
  setValue('otherField', 'new value') // Sibling field
  setValue('group.nestedField', 'value') // Nested field (dot notation)
}
```

## Best Practices

**Progressive disclosure:** Use `visibleWhen` to show fields only when relevant. Better UX than overwhelming users.

**Keep groups nested:** Field-group values nest in form data. Access them as `allValues.groupName.fieldName`.

**Dynamic when needed:** Use function-based `rules`, `description`, and `options` only when they depend on other fields. Static is simpler.

**onChange sparingly:** It's powerful but can make forms brittle. Most cross-field logic works better with `visibleWhen` and dynamic `rules`.

**Extract patterns:** If you use the same fields in 3+ places, make a factory function. Your future self will thank you.

**Remove separators for tight groups:** Add `isNoSeparatorAfter: true` to the first field in a pair that should feel like one unit (e.g., first name / last name).

**Error indicators work automatically:** Collapsible field-groups and tabs automatically display error badges when child fields have validation errors. You don't need to manage this manually.

**Form submission:** Text-based fields (text, textarea, number, currency) submit the form when Enter is pressed. This is standard form behavior. For multi-line textareas, Shift+Enter adds a new line.
