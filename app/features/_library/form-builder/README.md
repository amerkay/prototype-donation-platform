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
import {
  dateField,
  colorField,
  richTextField,
  imageUploadField,
  sliderField,
  emojiField,
  cardField,
  alertField,
  hiddenField,
  componentField
} from '~/features/form-builder/api'

// Date picker with optional min/max constraints
const startDate = dateField('startDate', {
  label: 'Start Date',
  minDate: '2026-01-01', // ISO string
  maxDate: '2026-12-31',
  rules: z.string().min(1)
})

// Color picker (swatch + hex input)
const brandColor = colorField('brandColor', {
  label: 'Brand Color',
  defaultValue: '#3b82f6'
})

// Rich text editor (Tiptap WYSIWYG)
const body = richTextField('body', {
  label: 'Content',
  variables: [
    { value: '{{name}}', label: 'Donor Name' },
    { value: '{{amount}}', label: 'Amount' }
  ] // Optional insertable variables (also accepts ComputedRef)
})

// Image upload with constraints
const logo = imageUploadField('logo', {
  label: 'Logo',
  accept: 'image/png,image/jpeg',
  maxSizeMB: 5,
  recommendedDimensions: '400×400px'
})

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

// Display-only alert (uses shadcn Alert variants)
const currencyNotice = alertField('currencyNotice', {
  variant: 'info',
  label: 'Currency Configuration',
  description: 'This form uses your organization-level currency settings.',
  cta: {
    label: 'Edit currency settings',
    to: '/admin/settings/currency#currencyMultipliers'
  }
})

// Hidden field (for tracking data not shown to user)
const source = hiddenField('source', {
  defaultValue: 'campaign-123'
})

// Component field (render custom Vue component)
import FormsList from '~/components/FormsList.vue'
const formsList = componentField('formsList', {
  component: FormsList,
  // Validate using the formsCount prop that will be injected by parent
  rules: z.any().refine(
    (props: Record<string, unknown>) => {
      return (props?.formsCount as number | undefined) ?? 0 > 0
    },
    { message: 'At least one donation form is required for this campaign' }
  )
})
// Renders arbitrary components with full validation support
// Props can be injected dynamically by parent component
```

## Container Fields

**Which container?**

- `fieldGroup` → Related fields with nested data (address, contact)
- `tabsField` → Exclusive sections, one active (payment methods, preferences)
- `arrayField` → Repeating user-added items (skills, contacts)
- `cardField` → Display-only, no nesting (instructions, tips)
- `alertField` → Display-only alert/callout (info, destructive, default)

```typescript
import {
  fieldGroup,
  tabsField,
  arrayField,
  textField,
  toggleField
} from '~/features/form-builder/api'
import { z } from 'zod'

// Group fields with wrapperClass for card styling
const formSettings = fieldGroup('formSettings', {
  label: 'Form Settings',
  description: 'Configure basic form settings and branding.',
  collapsible: true,
  collapsibleDefaultOpen: true,
  wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border', // Styles Accordion wrapper
  fields: {
    title: textField('title', { label: 'Title' }),
    subtitle: textField('subtitle', { label: 'Subtitle' })
  }
})
// wrapperClass styles the Accordion/FieldSet container, 'class' styles content

// Group with external state sync
const openSectionId = ref<string | undefined>('address')
const shippingAddress = fieldGroup('shippingAddress', {
  label: 'Shipping',
  collapsible: true,
  collapsibleStateRef: openSectionId, // Bi-directional sync with external ref
  fields: {
    /* ... */
  }
})
// openSectionId updates when accordion opens/closes, and vice versa

// Container-level validation
const notifications = fieldGroup('notifications', {
  label: 'Notification Settings',
  collapsible: true,
  fields: {
    email: toggleField('email', { label: 'Email' }),
    sms: toggleField('sms', { label: 'SMS' })
  },
  rules: z
    .object({
      email: z.boolean(),
      sms: z.boolean()
    })
    .refine((data) => data.email || data.sms, {
      message: 'At least one notification method required'
    })
})
// Validation applies to entire container, error badge persists when collapsed

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
// Real example: disable field type selector once selected
const fieldType = selectField('type', {
  label: 'Field Type',
  placeholder: 'Choose field type...',
  options: fieldTypeOptions,
  disabled: ({ values }: { values: Record<string, unknown> }) => !!values.type,
  rules: z.enum(['text', 'number', 'select'], { message: 'Please select a field type' })
})

// Dynamic descriptions based on context
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
// All text props accept functions or ComputedRef: label, description, placeholder
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

### onVisibilityChange Callbacks

React to field visibility changes (e.g., clear value when hidden).

```typescript
import { OnVisibilityChangeContext } from '~/features/form-builder/types'

// Real example from custom fields - clear value when field becomes hidden
const customField = textField('customField', {
  label: 'Custom Field',
  visibleWhen: visibilityConditions.visibleWhen,
  onVisibilityChange: ({ visible, clearValue }: OnVisibilityChangeContext) => {
    if (!visible) {
      clearValue('customField') // Clear without triggering validation
    }
  }
})
```

**OnVisibilityChangeContext:**

- `visible` → Whether field is now visible
- `value` → Current field value
- `values` → Form values + context
- `setValue(path, value)` → Update field (relative paths)
- `clearValue(path)` → Clear value without validation
- `parent`, `root`, `form` → Context variants

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

## Store Auto-Mapping (Admin Config Forms)

Eliminate getData/setData boilerplate using convention-based mapping. By default, field-group names map to store properties.

```typescript
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

// AUTO-MAPPING: No getData/setData needed! ✨
const { formRef, modelValue, expose } = useAdminConfigForm({
  store: useCampaignConfigStore(),
  form: createCampaignConfigMaster()
})
```

**Override convention with `$storePath` metadata:**

```typescript
// Flatten: form.basicSettings.name → store.name (not store.basicSettings.name)
const basicSettings = fieldGroup('basicSettings', {
  fields: { name, status, formsList },
  $storePath: { name: 'name', status: 'status' } // formsList excluded (component field)
})

// Map nested paths: form.amounts.frequencies → store.donationAmounts.frequencies
const amounts = fieldGroup('amounts', {
  fields: { frequencies, defaultAmount },
  $storePath: {
    frequencies: 'donationAmounts.frequencies',
    defaultAmount: 'donationAmounts.defaultAmount'
  }
})

// Exclude from mapping
const preview = fieldGroup('preview', {
  fields: { component: componentField(...) },
  $storePath: null // Skip - component only
})
```

**Deep store paths require pre-populated data:**

When `$storePath` maps to nested store paths (e.g., `overrides.USD.enabled`), the store **must** pre-populate all intermediate objects with defaults. This ensures form fields read the pre-populated values and write them back unchanged, preventing spurious dirty state when expanding collapsibles.

```typescript
// ✅ Pre-populated — form reads store values, writes them back unchanged
const store = { overrides: { USD: { enabled: false, name: '' } } }

// ❌ Empty — getData returns undefined, setData skips writes (fail-safe, but broken)
const store = { overrides: {} }
```

Without pre-population, `setData` silently skips writes when intermediates are missing. This prevents spurious dirty state but breaks functionality — user changes are lost.

This matches the currency multipliers pattern: `currencyMultipliers: { USD: 1.0, EUR: 1.0 }` — all supported currencies have default entries.

**Manual mapping (backward compatible):**

```typescript
const { formRef, modelValue } = useAdminConfigForm({
  store: useCurrencyStore(),
  form: useCurrencyForm,
  autoMap: false,
  getData: (s) => ({ currencies: { supported: s.supportedCurrencies } }),
  setData: (s, v) => s.updateSettings(v.currencies)
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
- `resetToValues(newValues: Record<string, unknown>): void`

```vue
<script setup lang="ts">
const form = useContactForm()
const data = ref({})
const originalData = ref({})
const formRef = ref<InstanceType<typeof FormRenderer>>()

function manualSubmit() {
  if (formRef.value?.isValid) {
    formRef.value.onSubmit()
  }
}

function discardChanges() {
  // Reset without remounting
  formRef.value?.resetToValues(originalData.value)
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

## Deep Linking (URL Hash Navigation)

Link directly to any field using URL hashes. Forms auto-expand collapsible groups, switch tabs, and highlight the target field.

**Syntax:**

- Short: `#fieldName` → Resolves to first match (e.g., `#supportedCurrencies`)
- Full path: `#group.field` → Exact location (e.g., `#currencies.currencyMultipliers.USD`)
- Array item: `#arrayField.0` → Scrolls to + highlights item at index 0

**Examples:**

```
/admin/settings/currency#defaultCurrency
/admin/settings/currency#supportedCurrencies
/admin/settings/currency#currencies.currencyMultipliers
/admin/settings/currency#currencies.currencyMultipliers.USD
/admin/campaigns/form-id/edit#donationAmounts.frequencies.monthly
/admin/settings/charity#charityCosts.costs.0       ← first cost row
/admin/settings/charity#charityCosts.costs.2       ← third cost row
```

Target fields receive animated ring highlight (3x flash, then persistent until user interaction). Ideal for validation error links, documentation, and support workflows.

**Array item targeting:** Use dot-notation index (`arrayField.0`, `arrayField.1`) to target a specific item inside an `arrayField`. The array container scrolls to and briefly highlights the item. Use this in `data-field` attributes on preview elements that correspond to repeating items (e.g., table rows mapping to array entries):

```vue
<!-- In preview component — each row maps to its array item -->
<TableRow
  v-for="(item, index) in items"
  :key="item.id"
  :data-field="targets?.items ? `${targets.items}.${index}` : undefined"
/>
```

## Filter System

Build condition-based admin filters with automatic form generation, URL sync, and item evaluation.

```typescript
import { useFilterState } from '~/features/form-builder/filters'
import type { ContextSchema } from '~/features/form-builder/conditions'

const filterSchema: ContextSchema = {
  donorName: { label: 'Donor', type: 'text' },
  amount: { label: 'Amount', type: 'number' },
  status: { label: 'Status', type: 'text', options: ['completed', 'pending', 'failed'] }
}

const {
  form, // ComposableForm — render with FormRenderer
  filterValues, // Ref<FilterConditionValues> — v-model binding
  activeFilterCount, // Computed<number> — badge count
  resetFilters, // () => void — clear all
  filterItem // (item) => boolean — predicate for Array.filter()
} = useFilterState('donations', filterSchema, {
  // Optional: custom evaluators for complex field access
  customEvaluators: {
    'items.name': (conditionValue, item, operator) => {
      const items = (item as any).items || []
      return items.some((i: any) => OPERATORS[operator](i.name, conditionValue))
    }
  }
})

// Filter state auto-syncs to URL via base64 `_f` query param
const displayed = computed(() => allItems.value.filter(filterItem))
```

```vue
<template>
  <FormRenderer :section="form" v-model="filterValues" />
</template>
```

## Condition Builder UI

Two pre-built condition builder variants for admin UIs. Both share core utilities from `conditions/ui/`.

```typescript
// For custom-fields: collapsible conditions with field reference validation
import { buildConditionItemField } from '~/features/form-builder/conditions'
const conditionField = buildConditionItemField(precedingFields, contextSchema)

// For filters: flat condition rows (no accordion, no validation)
import { buildFilterForm } from '~/features/form-builder/conditions/ui/build-filter-form'
const filterForm = buildFilterForm('myFilter', contextSchema)
```

Shared utilities in `conditions/ui/condition-utils.ts`: `contextSchemaToFields`, `getFieldOperators`, `buildOperatorField`, `autoSelectDefaults`, `buildDisplayLabel`.

## HTML Sanitization

All `v-html` usage must sanitize content:

```typescript
import { sanitizeRichText, escapeHtml } from '~/features/form-builder/utils/sanitize-html'

// Rich text (allows p, strong, em, u, a, span, br)
const safe = sanitizeRichText(unsafeHtml)

// Email profile (adds div, img, style)
const safeEmail = sanitizeRichText(html, { profile: 'email' })

// Escape for interpolation
const escaped = escapeHtml(userInput)
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
  id?: string | ComputedRef<string> | (ctx: FieldContext) => string // Custom input id override
  label?: string | ComputedRef<string> | (ctx: FieldContext) => string
  description?: string | ComputedRef<string> | (ctx: FieldContext) => string
  placeholder?: string | ComputedRef<string> | (ctx: FieldContext) => string
  defaultValue?: unknown
  optional?: boolean               // "(optional)" badge
  disabled?: boolean | ComputedRef<boolean> | (ctx: FieldContext) => boolean
  visibleWhen?: ((ctx: FieldContext) => boolean) | ConditionGroup
  rules?: z.ZodTypeAny | ComputedRef<z.ZodTypeAny> | (ctx: FieldContext) => z.ZodTypeAny
  onChange?: (ctx: OnChangeContext) => void
  onVisibilityChange?: (ctx: OnVisibilityChangeContext) => void
  showSeparatorAfter?: boolean | (ctx: FieldContext) => boolean  // Conditional separator
  class?: string | ComputedRef<string> | (ctx: FieldContext) => string
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

interface OnVisibilityChangeContext extends FieldContext {
  visible: boolean // Whether field is now visible
  value: unknown // Current field value
  setValue: SetFieldValueFn // Update field values
  clearValue: (relativePath: string) => void // Clear without validation
  path?: string // Full path to current field
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
- **Dynamic when needed:** Use functions/ComputedRef only when depending on other fields
- **onChange sparingly:** Most logic better served by `visibleWhen` + dynamic `rules`
- **Extract patterns:** Reuse common field sets via factory functions returning `Record<string, FieldDef>`
- **Separators:** Add `showSeparatorAfter: true` or `(ctx) => condition` for visual separation
- **Validation on edit forms:** Set `validate-on-mount` for pre-filled forms
- **Form submission:** Text fields submit on Enter; textareas use Shift+Enter for newline
- **Container validation:** Use `rules` on field-groups/tabs for cross-field validation ("at least one required")
- **Store mapping:** Use `$storePath` metadata + `autoMap` in admin forms to eliminate boilerplate
- **Disabled state:** Use `disabled` property (not `isDisabled`) with boolean/ComputedRef/function

```typescript
// Real example: showSeparatorAfter for visual grouping
const enabled = toggleField('enabled', {
  label: 'Enable Cover Costs Feature',
  description: 'Allow donors to optionally cover operational costs',
  labelClass: 'font-bold',
  showSeparatorAfter: true // Add visual separator after this field
})

// Conditional separator based on field value
const backgroundType = radioGroupField('backgroundType', {
  label: 'Background',
  options: [
    { value: 'white', label: 'White' },
    { value: 'image', label: 'Image' }
  ],
  showSeparatorAfter: (ctx) => ctx.values.backgroundType === 'white'
})
```
