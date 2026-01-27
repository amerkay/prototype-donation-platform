# Form Builder

Type-safe forms with minimal code. Define fields using composables, get validation and conditional logic for free.

```typescript
import { defineForm, textField } from '~/features/form-builder/api'

export const useContactForm = defineForm('contact', (ctx) => {
  const name = textField('name', {
    label: 'Name',
    rules: z.string().min(2)
  })

  const email = textField('email', {
    label: 'Email',
    rules: z.string().email()
  })

  return { name, email }
})
```

```vue
<script setup lang="ts">
const form = useContactForm()
const data = ref({})
</script>

<template>
  <FormRenderer :section="form" v-model="data" @submit="handleSubmit" />
</template>
```

## Essential Fields

### text / textarea

```typescript
import { textField, textareaField } from '~/features/form-builder/api'

const email = textField('email', {
  label: 'Email',
  placeholder: 'john@example.com',
  autocomplete: 'email', // Standard HTML autocomplete
  rules: z.string().email()
})

const message = textareaField('message', {
  label: 'Message',
  rows: 5, // Height control
  maxLength: 500, // Character limit
  rules: z.string().min(10)
})
```

### number / currency

```typescript
import { numberField, currencyField } from '~/features/form-builder/api'

const quantity = numberField('quantity', {
  label: 'Quantity',
  min: 1,
  max: 100,
  step: 1,
  rules: z.number().min(1)
})

const amount = currencyField('amount', {
  label: 'Donation',
  currencySymbol: '$', // Or dynamic: (ctx) => ctx.values.currency === 'USD' ? '$' : '£'
  min: 1,
  rules: z.number().min(1)
})
```

### toggle / checkbox

```typescript
import { toggleField, checkboxField } from '~/features/form-builder/api'

const subscribe = toggleField('subscribe', {
  label: 'Subscribe to newsletter',
  description: 'Get weekly updates',
  optional: true // Shows "(optional)" badge, no validation required
})

// Single checkbox (boolean)
const acceptTerms = checkboxField('acceptTerms', {
  label: 'I accept terms',
  rules: z.boolean().refine((val) => val === true, 'Required')
})

// Multiple checkboxes (array)
const interests = checkboxField('interests', {
  label: 'Interests',
  options: [
    { value: 'tech', label: 'Technology' },
    { value: 'music', label: 'Music' }
  ],
  rules: z.array(z.string()).min(1)
})
```

## Selection Fields

```typescript
import {
  selectField,
  comboboxField,
  autocompleteField,
  radioGroupField
} from '~/features/form-builder/api'

// Native dropdown - fast, familiar
const country = selectField('country', {
  label: 'Country',
  options: [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' }
  ],
  rules: z.string().min(1)
})

// Searchable select - better for long lists
const tags = comboboxField('tags', {
  label: 'Tags',
  placeholder: 'Select tags',
  searchPlaceholder: 'Search...',
  multiple: true, // Single or multiple selection
  options: [
    /* ... */
  ]
  // Dynamic options from context:
  // options: (ctx) => ctx.values.availableTags?.map(t => ({ value: t.id, label: t.name }))
})

// Async typeahead with remote search
const city = autocompleteField('city', {
  label: 'City',
  searchPlaceholder: 'Type to search...',
  fetchOptions: async (query) => {
    const res = await fetch(`/api/cities?q=${query}`)
    const cities = await res.json()
    return cities.map((c) => ({
      value: c.id,
      label: c.name,
      data: c // Store full object for onChange access
    }))
  },
  onChange: ({ value, setValue }) => {
    if (value?.data) {
      setValue('timezone', value.data.timezone)
    }
  }
})

// Radio buttons
const plan = radioGroupField('plan', {
  label: 'Choose plan',
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro - $10/mo' }
  ],
  orientation: 'vertical', // or 'horizontal'
  rules: z.enum(['free', 'pro'])
})
```

## Specialized Fields

```typescript
import { sliderField, emojiField, cardField, hiddenField } from '~/features/form-builder/api'

// Range slider with dynamic props
const volume = sliderField('volume', {
  label: 'Volume',
  min: 0, // Or dynamic: (ctx) => ctx.values.mode === 'pro' ? 0 : 10
  max: 100,
  step: 1,
  formatValue: (val) => `${val}%`,
  showMinMax: true, // Display min/max labels
  prefix: 'Set', // Text before value
  suffix: 'level' // Text after value
})

// Emoji picker
const reaction = emojiField('reaction', {
  label: 'How do you feel?',
  placeholder: '😊',
  maxLength: 3 // Allow multiple emojis
})

// Display-only card
const info = cardField('info', {
  label: 'Important',
  description: 'Your data is encrypted.',
  imageSrc: '/icon.svg',
  imageAlt: 'Security',
  content: '<p>Rich HTML content</p>' // Optional raw HTML
})

// Hidden field (for tracking data not shown to user)
const source = hiddenField('source', {
  defaultValue: 'campaign-123'
})
```

## Container Fields

**Which container?**

- `fieldGroup` → Related fields with nested data (address, contact)
- `tabsField` → Exclusive sections, one active (payment methods, preferences)
- `arrayField` → Repeating user-added items (skills, contacts)
- `cardField` → Display-only, no nesting (instructions, tips)

```typescript
import { fieldGroup, tabsField, arrayField, textField } from '~/features/form-builder/api'

// Group fields with layout
const address = fieldGroup('address', {
  label: 'Address',
  class: 'grid grid-cols-2 gap-3',
  collapsible: true, // Optional accordion
  collapsibleDefaultOpen: false,
  badgeLabel: 'Optional',
  fields: {
    street: textField('street', { label: 'Street' }),
    city: textField('city', { label: 'City' }),
    zip: textField('zip', { label: 'ZIP' })
  }
})
// Data: { address: { street, city, zip } }

// Tabbed sections
const contact = tabsField('contact', {
  label: 'Contact',
  defaultValue: 'email',
  tabs: [
    {
      value: 'email',
      label: 'Email',
      badgeLabel: 'Primary', // Optional tab badge
      fields: {
        emailAddress: textField('emailAddress', { label: 'Email' })
      }
    },
    {
      value: 'sms',
      label: 'SMS',
      fields: {
        phone: textField('phone', { label: 'Phone' })
      }
    }
  ]
})
// Data: { contact: { email: { emailAddress }, sms: { phone } } }

// Dynamic arrays with drag-and-drop
const skills = arrayField('skills', {
  label: 'Skills',
  addButtonText: 'Add Skill',
  removeButtonText: 'Remove', // Optional custom text
  sortable: true, // Enable drag-to-reorder
  itemField: textField('', {
    placeholder: 'e.g., JavaScript'
  })
})
// Data: { skills: ['JavaScript', 'TypeScript'] }

// Complex array items
const contacts = arrayField('contacts', {
  label: 'Contacts',
  addButtonText: 'Add',
  sortable: true,
  itemField: fieldGroup('', {
    class: 'grid grid-cols-2 gap-3',
    fields: {
      name: textField('name', { label: 'Name' }),
      phone: textField('phone', { label: 'Phone' })
    }
  })
})
// Data: { contacts: [{ name, phone }, ...] }
```

**Auto error indicators:** Collapsible groups and tabs show red error badges when children have validation errors.

## Making Forms Interactive

### Conditional Visibility

Hidden fields are excluded from validation—won't block submission.

```typescript
// Function-based (simple)
const accountType = radioGroupField('accountType', {
  options: [
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' }
  ]
})

const companyName = textField('companyName', {
  label: 'Company Name',
  visibleWhen: (ctx) => ctx.values.accountType === 'business',
  rules: z.string().min(1)
})

// Declarative (serializable for database storage)
const companyNameAlt = textField('companyName', {
  label: 'Company Name',
  visibleWhen: {
    match: 'all', // 'all' (AND), 'any' (OR), 'none' (NOT)
    conditions: [{ field: 'accountType', operator: 'in', value: ['business'] }]
  },
  rules: z.string().min(1)
})
// Operators: contains, notContains, greaterOrEqual, lessOrEqual,
//            empty, notEmpty, isTrue, isFalse, in, notIn
```

### External Context

Inject external data into form logic without adding to form fields. Context values merge at root level in `ctx.values`.

```vue
<script setup lang="ts">
const form = useDonationForm()
const data = ref({})
</script>

<template>
  <FormRenderer
    :section="form"
    v-model="data"
    :context="{ donationTotal: 100, userCountry: 'US' }"
    :context-schema="{
      donationTotal: { label: 'Donation Total', type: 'number' },
      userCountry: { label: 'User Country', type: 'text' }
    }"
  />
</template>
```

```typescript
const coverCosts = sliderField('coverCosts', {
  label: 'Cover Costs',
  max: (ctx) => ctx.values.donationTotal * 0.03, // Access context
  visibleWhen: (ctx) => ctx.values.donationTotal > 10
})
```

**Note:** Context in `ctx.values` but NOT in emitted `modelValue` or submission data.

### Dynamic Validation & Text

```typescript
const phone = textField('phone', {
  label: 'Phone',
  description: (ctx) =>
    ctx.values.country === 'US' ? 'Format: (555) 123-4567' : 'Include country code',
  rules: (ctx) => {
    if (ctx.values.country === 'US') {
      return z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/)
    }
    return z.string().min(1)
  }
})
// All text props accept functions: label, description, placeholder
```

### onChange Callbacks

React to field changes, update other fields.

```typescript
const sendEmail = toggleField('sendEmail', {
  label: 'Send email',
  onChange: ({ value, setValue }) => {
    if (!value) {
      setValue('emailAddress', '') // Clear related field
    }
  }
})

const emailAddress = textField('emailAddress', {
  label: 'Email',
  visibleWhen: (ctx) => ctx.values.sendEmail === true,
  rules: (ctx) => (ctx.values.sendEmail ? z.string().email() : z.string().optional())
})
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
import { textField } from '~/features/form-builder/api'
import type { FieldDef } from '~/features/form-builder/types'

export function useAddressFields(section = 'shipping'): Record<string, FieldDef> {
  const street = textField('street', {
    label: 'Street',
    autocomplete: `${section} address-line1`
  })

  const city = textField('city', {
    label: 'City',
    autocomplete: `${section} address-level2`
  })

  const zip = textField('zip', {
    label: 'ZIP',
    autocomplete: `${section} postal-code`
  })

  return { street, city, zip }
}

// Usage in defineForm
export const useCheckoutForm = defineForm('checkout', (ctx) => {
  // Flat fields
  const name = textField('name', { label: 'Name' })

  // Reusable field set
  const shippingAddress = fieldGroup('shippingAddress', {
    label: 'Shipping Address',
    fields: useAddressFields('shipping')
  })

  return { name, shippingAddress }
})
```

## API Reference

### FormRenderer Props

```typescript
interface FormRendererProps {
  section: ComposableForm // Form composable result
  modelValue: Record<string, unknown> // v-model binding
  context?: Record<string, unknown> // External values (default: {})
  contextSchema?: ContextSchema // Context field descriptions
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
const form = useContactForm()
const data = ref({})
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

### defineForm

```typescript
import { defineForm } from '~/features/form-builder/api'

/**
 * Define a form using Composition API
 */
export const useMyForm = defineForm('form-id', (ctx) => {
  // Set form metadata
  ctx.title = 'My Form'
  ctx.description = 'Fill out the details'

  // Define fields
  const name = textField('name', { label: 'Name' })
  const email = textField('email', { label: 'Email' })

  // Return field definitions
  return { name, email }
})

// Optional: Add root schema for cross-field validation
export const usePasswordForm = defineForm(
  'password',
  (ctx) => {
    const password = textField('password', {
      label: 'Password',
      type: 'password'
    })
    const confirmPassword = textField('confirmPassword', {
      label: 'Confirm Password',
      type: 'password'
    })
    return { password, confirmPassword }
  },
  z
    .object({
      password: z.string(),
      confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword']
    })
)
```

**Extract defaults:**

```typescript
import { extractDefaultValues } from '~/features/form-builder/utils/defaults'

export const useContactForm = defineForm('contact', (ctx) => {
  const name = textField('name', { defaultValue: '' })
  const age = numberField('age', { defaultValue: 18 })
  return { name, age }
})

const form = useContactForm()
const data = ref(extractDefaultValues(form.fields))
// { name: '', age: 18 }
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
  showSeparatorAfter?: boolean       // Show separator after field
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
- **Composables:** Use `defineForm` for all form definitions—enables reactivity and reusability
- **Field constructors:** Import constructors from `~/features/form-builder/api` instead of writing object literals
- **Dynamic when needed:** Use functions only when depending on other fields
- **onChange sparingly:** Most logic better served by `visibleWhen` + dynamic `rules`
- **Extract patterns:** Reuse common field sets via factory functions returning `Record<string, FieldDef>`
- **Separators:** Add `showSeparatorAfter: true` for visual separation
- **Validation on edit forms:** Set `validate-on-mount` for pre-filled forms
- **Form submission:** Text fields submit on Enter; textareas use Shift+Enter for newline
