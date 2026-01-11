# Form Builder

Type-safe forms with minimal code. Define structure, get validation and conditional logic for free.

```typescript
const form: FormDef = {
  id: 'contact',
  fields: {
    name: { type: 'text', label: 'Name', rules: z.string().min(2) },
    email: { type: 'text', label: 'Email', rules: z.string().email() }
  }
}
```

```vue
<FormRenderer :section="form" v-model="data" @submit="handleSubmit" />
```

## Essential Fields

### text / textarea

```typescript
email: {
  type: 'text',
  label: 'Email',
  placeholder: 'john@example.com',
  autocomplete: 'email',  // Standard HTML autocomplete
  rules: z.string().email()
}

message: {
  type: 'textarea',
  label: 'Message',
  rows: 5,                 // Height control
  maxLength: 500,          // Character limit
  rules: z.string().min(10)
}
```

### number / currency

```typescript
quantity: {
  type: 'number',
  label: 'Quantity',
  min: 1,
  max: 100,
  step: 1,
  rules: z.number().min(1)
}

amount: {
  type: 'currency',
  label: 'Donation',
  currencySymbol: '$',     // Or dynamic: (values) => values.currency === 'USD' ? '$' : '£'
  min: 1,
  rules: z.number().min(1)
}
```

### toggle / checkbox

```typescript
subscribe: {
  type: 'toggle',
  label: 'Subscribe to newsletter',
  description: 'Get weekly updates',
  optional: true           // Shows "(optional)" badge, no validation required
}

// Single checkbox (boolean)
acceptTerms: {
  type: 'checkbox',
  label: 'I accept terms',
  rules: z.boolean().refine(val => val === true, 'Required')
}

// Multiple checkboxes (array)
interests: {
  type: 'checkbox',
  label: 'Interests',
  options: [
    { value: 'tech', label: 'Technology' },
    { value: 'music', label: 'Music' }
  ],
  rules: z.array(z.string()).min(1)
}
```

## Selection Fields

```typescript
// Native dropdown - fast, familiar
country: {
  type: 'select',
  label: 'Country',
  options: [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' }
  ],
  rules: z.string().min(1)
}

// Searchable select - better for long lists
tags: {
  type: 'combobox',
  label: 'Tags',
  placeholder: 'Select tags',
  searchPlaceholder: 'Search...',
  multiple: true,          // Single or multiple selection
  options: [/* ... */],
  // Dynamic options from context:
  // options: (ctx) => ctx.values.availableTags?.map(t => ({ value: t.id, label: t.name }))
}

// Async typeahead with remote search
city: {
  type: 'autocomplete',
  label: 'City',
  searchPlaceholder: 'Type to search...',
  fetchOptions: async (query) => {
    const res = await fetch(`/api/cities?q=${query}`)
    const cities = await res.json()
    return cities.map(c => ({
      value: c.id,
      label: c.name,
      data: c              // Store full object for onChange access
    }))
  },
  onChange: ({ value, setValue }) => {
    if (value?.data) {
      setValue('timezone', value.data.timezone)
    }
  }
}

// Radio buttons
plan: {
  type: 'radio-group',
  label: 'Choose plan',
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro - $10/mo' }
  ],
  orientation: 'vertical', // or 'horizontal'
  rules: z.enum(['free', 'pro'])
}
```

## Specialized Fields

```typescript
// Range slider with dynamic props
volume: {
  type: 'slider',
  label: 'Volume',
  min: 0,                  // Or dynamic: (values) => values.mode === 'pro' ? 0 : 10
  max: 100,
  step: 1,
  formatValue: (val) => `${val}%`,
  showMinMax: true,        // Display min/max labels
  prefix: 'Set',           // Text before value
  suffix: 'level'          // Text after value
}

// Emoji picker
reaction: {
  type: 'emoji',
  label: 'How do you feel?',
  placeholder: '😊',
  maxLength: 3             // Allow multiple emojis
}

// Display-only card
info: {
  type: 'card',
  label: 'Important',
  description: 'Your data is encrypted.',
  imageSrc: '/icon.svg',
  imageAlt: 'Security',
  content: '<p>Rich HTML content</p>'  // Optional raw HTML
}

// Admin-only: visual condition builder
visibilityRules: {
  type: 'condition-builder',
  label: 'Show when',
  optional: true,
  formFields: otherFields  // Available fields for dropdown
}
```

## Container Fields

**Which container?**

- `field-group` → Related fields with nested data (address, contact)
- `tabs` → Exclusive sections, one active (payment methods, preferences)
- `array` → Repeating user-added items (skills, contacts)
- `card` → Display-only, no nesting (instructions, tips)

```typescript
// Group fields with layout
address: {
  type: 'field-group',
  label: 'Address',
  class: 'grid grid-cols-2 gap-3',
  collapsible: true,       // Optional accordion
  collapsibleDefaultOpen: false,
  badgeLabel: 'Optional',
  fields: {
    street: { type: 'text', label: 'Street' },
    city: { type: 'text', label: 'City' },
    zip: { type: 'text', label: 'ZIP' }
  }
}
// Data: { address: { street, city, zip } }

// Tabbed sections
contact: {
  type: 'tabs',
  label: 'Contact',
  defaultValue: 'email',
  tabs: [
    {
      value: 'email',
      label: 'Email',
      badgeLabel: 'Primary',  // Optional tab badge
      fields: {
        emailAddress: { type: 'text', label: 'Email' }
      }
    },
    {
      value: 'sms',
      label: 'SMS',
      fields: {
        phone: { type: 'text', label: 'Phone' }
      }
    }
  ]
}
// Data: { contact: { email: { emailAddress }, sms: { phone } } }

// Dynamic arrays with drag-and-drop
skills: {
  type: 'array',
  label: 'Skills',
  addButtonText: 'Add Skill',
  removeButtonText: 'Remove',  // Optional custom text
  sortable: true,              // Enable drag-to-reorder
  itemField: {
    type: 'text',
    placeholder: 'e.g., JavaScript'
  }
}
// Data: { skills: ['JavaScript', 'TypeScript'] }

// Complex array items
contacts: {
  type: 'array',
  label: 'Contacts',
  addButtonText: 'Add',
  sortable: true,
  itemField: {
    type: 'field-group',
    class: 'grid grid-cols-2 gap-3',
    fields: {
      name: { type: 'text', label: 'Name' },
      phone: { type: 'text', label: 'Phone' }
    }
  }
}
// Data: { contacts: [{ name, phone }, ...] }
```

**Auto error indicators:** Collapsible groups and tabs show red error badges when children have validation errors.

## Making Forms Interactive

### Conditional Visibility

Hidden fields are excluded from validation—won't block submission.

```typescript
// Function-based (simple)
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
    visibleWhen: (ctx) => ctx.values.accountType === 'business',
    rules: z.string().min(1)
  }
}

// Declarative (serializable for database storage)
companyName: {
  type: 'text',
  label: 'Company Name',
  visibleWhen: {
    match: 'all',          // 'all' (AND), 'any' (OR), 'none' (NOT)
    conditions: [
      { field: 'accountType', operator: 'in', value: ['business'] }
    ]
  },
  rules: z.string().min(1)
}
// Operators: contains, notContains, greaterOrEqual, lessOrEqual,
//            empty, notEmpty, isTrue, isFalse, in, notIn
```

### External Context

Inject external data into form logic without adding to form fields. Context values merge at root level in `ctx.values`.

```vue
<FormRenderer
  :section="form"
  v-model="data"
  :context="{ donationTotal: 100, userCountry: 'US' }"
  :context-schema="{
    donationTotal: { label: 'Donation Total', type: 'number' },
    userCountry: { label: 'User Country', type: 'text' }
  }"
/>
```

```typescript
coverCosts: {
  type: 'slider',
  label: 'Cover Costs',
  max: (ctx) => ctx.values.donationTotal * 0.03,  // Access context
  visibleWhen: (ctx) => ctx.values.donationTotal > 10
}
```

**Note:** Context in `ctx.values` but NOT in emitted `modelValue` or submission data.

### Dynamic Validation & Text

```typescript
phone: {
  type: 'text',
  label: 'Phone',
  description: (ctx) =>
    ctx.values.country === 'US'
      ? 'Format: (555) 123-4567'
      : 'Include country code',
  rules: (ctx) => {
    if (ctx.values.country === 'US') {
      return z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/)
    }
    return z.string().min(1)
  }
}
// All text props accept functions: label, description, placeholder
```

### onChange Callbacks

React to field changes, update other fields.

```typescript
sendEmail: {
  type: 'toggle',
  label: 'Send email',
  onChange: ({ value, setValue }) => {
    if (!value) {
      setValue('emailAddress', '')  // Clear related field
    }
  }
},
emailAddress: {
  type: 'text',
  label: 'Email',
  visibleWhen: (ctx) => ctx.values.sendEmail === true,
  rules: (ctx) =>
    ctx.values.sendEmail ? z.string().email() : z.string().optional()
}
```

**OnChangeContext:**

- `value` → New field value
- `values` → Form values + context
- `setValue(path, value)` → Update field (relative paths)
- `setFieldError(field, message)` → Set validation error
- `setFieldTouched(field, touched)` → Mark touched
- `parent`, `root`, `form` → Context variants

**Use sparingly.** Prefer `visibleWhen` and dynamic `rules` for maintainability.

## Reusable Field Sets

Extract repeated patterns into factory functions.

```typescript
// app/features/forms/address-fields.ts
import type { FieldMetaMap } from '~/features/form-builder/types'

export function createAddressFields(section = 'shipping'): FieldMetaMap {
  return {
    street: {
      type: 'text',
      label: 'Street',
      autocomplete: `${section} address-line1`
    },
    city: {
      type: 'text',
      label: 'City',
      autocomplete: `${section} address-level2`
    },
    zip: {
      type: 'text',
      label: 'ZIP',
      autocomplete: `${section} postal-code`
    }
  }
}

// Usage
fields: {
  ...createAddressFields('shipping'),  // Flat
  billingAddress: {                    // Or nested in group
    type: 'field-group',
    label: 'Billing',
    fields: createAddressFields('billing')
  }
}
```

## API Reference

### FormRenderer Props

```typescript
interface FormRendererProps {
  section: FormDef // Form config
  modelValue: Record<string, unknown> // v-model binding
  context?: Record<string, unknown> // External values (default: {})
  contextSchema?: ContextSchema // Context field descriptions for condition-builder
  class?: string // CSS classes
  validateOnMount?: boolean // Validate immediately (default: false)
  updateOnlyWhenValid?: boolean // Only emit valid state (default: false)
}
```

**Events:**

- `update:modelValue` → Field changed
- `submit` → Form submitted and valid (Enter in text fields or `onSubmit()`)

**Exposed:**

- `isValid: ComputedRef<boolean>`
- `onSubmit(): void`

```vue
<script setup lang="ts">
const formRef = ref<InstanceType<typeof FormRenderer>>()

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
</template>
```

### FormDef

```typescript
interface FormDef {
  id: string // Unique identifier
  title?: string
  description?: string
  fields: FieldMetaMap // Field definitions
  schema?: z.ZodTypeAny // Root schema (cross-field validation only)
  defaultValue?: Record<string, unknown> // Use extractDefaultValues() utility instead
}

type FieldMetaMap = Record<string, FieldMeta>
```

**Extract defaults:**

```typescript
import { extractDefaultValues } from '~/features/form-builder/utils/defaults'

const form: FormDef = {
  id: 'contact',
  fields: {
    name: { type: 'text', defaultValue: '' },
    age: { type: 'number', defaultValue: 18 }
  }
}

const data = ref(extractDefaultValues(form.fields))
// { name: '', age: 18 }
```

**Root schema:** Only needed for cross-field validation after all field validations pass.

```typescript
schema: z.object({
  password: z.string(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})
```

### Common Field Properties

All fields support:

```typescript
{
  label?: string | (ctx: FieldContext) => string
  description?: string | (ctx: FieldContext) => string
  placeholder?: string | (ctx: FieldContext) => string
  defaultValue?: unknown
  optional?: boolean               // "(optional)" badge
  disabled?: boolean | (ctx: FieldContext) => boolean
  visibleWhen?: ((ctx: FieldContext) => boolean) | ConditionGroup
  rules?: z.ZodTypeAny | (ctx: FieldContext) => z.ZodTypeAny
  onChange?: (ctx: OnChangeContext) => void
  isSeparatorAfter?: boolean       // Show separator after field
  class?: string                   // Input CSS classes
  labelClass?: string
  descriptionClass?: string
  autocomplete?: string            // HTML autocomplete
}
```

### FieldContext

```typescript
interface FieldContext {
  values: Record<string, unknown> // Form values + external context (merged)
  parent?: Record<string, unknown> // Parent container values
  root: Record<string, unknown> // All values + context at top level
  form?: Record<string, unknown> // Pure form values (no context), for submission
}
```

### ConditionGroup

```typescript
interface ConditionGroup {
  conditions: Condition[]
  match: 'all' | 'any' | 'none' // AND, OR, NOT
}

interface Condition {
  field: string // Field path (dot notation)
  operator: ComparisonOperator // contains, in, greaterOrEqual, etc.
  value?: unknown // Static comparison
  valueFromField?: string // Compare against another field
}
```

## Best Practices

- **Progressive disclosure:** Use `visibleWhen` to show fields only when relevant
- **Nested data:** Field-group values nest: `values.groupName.fieldName`
- **Dynamic when needed:** Use functions only when depending on other fields
- **onChange sparingly:** Most logic better served by `visibleWhen` + dynamic `rules`
- **Extract patterns:** Reuse common field sets via factory functions
- **Separators:** Add `isSeparatorAfter: true` for visual separation
- **Validation on edit forms:** Set `validate-on-mount` for pre-filled forms
- **Form submission:** Text fields submit on Enter; textareas use Shift+Enter for newline
