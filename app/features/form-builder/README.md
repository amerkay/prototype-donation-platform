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
    return cities.map(c => ({ value: c.id, label: c.name, data: c }))
  },
  staticOptions: [
    { value: 'nyc', label: 'New York' }  // Shown before search
  ]
}
```

**Props:** `loadOptions: (query: string) => Promise<AutocompleteOption[]>`, `staticOptions`, `debounceMs`

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

**Props:** `currencySymbol`, `min`, `max`, `step`  
**Dynamic symbol:** `currencySymbol: (values) => getCurrencySymbol(values.currency)`

### slider

Range slider for selecting values on a scale.

```typescript
volume: {
  type: 'slider',
  label: 'Volume',
  min: 0,
  max: 100,
  step: 1,
  formatLabel: (val) => `${val}%`
}
```

**Props:** `min`, `max`, `step`, `formatLabel: (value: number) => string`

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
  title: 'Important Notice',
  content: 'Your data is encrypted and never shared.',
  icon: 'ℹ️'
}
```

**Props:** `title`, `content`, `icon`, `variant: 'default' | 'info' | 'warning'`

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

**Props:** `tabs: TabDefinition[]`, `defaultValue`, `tabsListClass`

### array

Dynamic list of items. Users can add/remove entries.

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

**Props:** `itemField`, `addButtonText`, `class` (applied to grid container)

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

**Events:**

- `update:modelValue` – Emitted on any field change
- `submit` – Emitted when form is submitted (Enter key or manual `onSubmit()`)

**Exposed Methods:**

- `isValid: boolean` – Current form validation state
- `onSubmit: () => void` – Manually trigger form submission

**Example:**

```vue
<script setup lang="ts">
const formRef = ref()
const data = ref({})

function manualSubmit() {
  if (formRef.value.isValid) {
    formRef.value.onSubmit()
  }
}
</script>

<template>
  <FormRenderer ref="formRef" :section="form" v-model="data" @submit="handleSubmit" />
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
