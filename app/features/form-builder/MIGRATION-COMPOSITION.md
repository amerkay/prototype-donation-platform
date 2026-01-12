# Form Builder: Object-Style → Composition API Migration Guide

## Pattern Transformation

**OLD** (Object-based):

```typescript
export function createMyForm(): FormDef {
  return {
    id: 'myForm',
    title: 'My Form',
    fields: {
      name: { type: 'text', label: 'Name', rules: z.string().min(1) }
    }
  }
}
```

**NEW** (Composition API):

```typescript
export const useMyForm = defineForm('myForm', (ctx) => {
  ctx.title = 'My Form'

  const name = textField('name', { label: 'Name', rules: z.string().min(1) })

  return { name }
})
```

## Migration Steps

### 1. Import Field Constructors

```typescript
import {
  defineForm,
  textField,
  selectField,
  toggleField,
  checkboxField,
  radioGroupField,
  comboboxField,
  currencyField,
  sliderField,
  arrayField,
  fieldGroup,
  tabsField,
  cardField
} from '~/features/form-builder/api'
import type { FieldDef } from '~/features/form-builder/api'
```

### 2. Convert Function Signature

```typescript
// OLD: Factory function returning FormDef
export function createMyForm(): FormDef {}

// NEW: Exported composable using defineForm
export const useMyForm = defineForm('formId', (ctx) => {})
```

### 3. Set Form Metadata via Context

```typescript
export const useMyForm = defineForm('formId', (ctx) => {
  ctx.title = 'Form Title' // FormSection.title
  ctx.description = 'Description' // FormSection.description
  // Continue with field definitions...
})
```

### 4. Convert Fields Using Constructors

#### Field Type Mapping

| Old `type`      | Constructor         | Example                                                     |
| --------------- | ------------------- | ----------------------------------------------------------- |
| `'text'`        | `textField()`       | `textField('name', { label: 'Name' })`                      |
| `'email'`       | `textField()`       | `textField('email', { label: 'Email', type: 'email' })`     |
| `'select'`      | `selectField()`     | `selectField('country', { options: [...] })`                |
| `'toggle'`      | `toggleField()`     | `toggleField('enabled', { label: 'Enable' })`               |
| `'checkbox'`    | `checkboxField()`   | `checkboxField('terms', { options: [...] })`                |
| `'radio-group'` | `radioGroupField()` | `radioGroupField('plan', { options: [...] })`               |
| `'combobox'`    | `comboboxField()`   | `comboboxField('tags', { options: [...], multiple: true })` |
| `'currency'`    | `currencyField()`   | `currencyField('amount', { min: 1, currencySymbol: '$' })`  |
| `'slider'`      | `sliderField()`     | `sliderField('rating', { min: 0, max: 100 })`               |
| `'array'`       | `arrayField()`      | `arrayField('items', { itemField: textField(...) })`        |
| `'field-group'` | `fieldGroup()`      | `fieldGroup('address', { fields: {...} })`                  |
| `'tabs'`        | `tabsField()`       | `tabsField('sections', { tabs: [...] })`                    |
| `'card'`        | `cardField()`       | `cardField('info', { fields: {...} })`                      |

#### Basic Field Conversion

```typescript
// OLD
fields: {
  name: { type: 'text', label: 'Name', placeholder: 'Enter name' }
}

// NEW
const name = textField('name', { label: 'Name', placeholder: 'Enter name' })
return { name }
```

### 5. Preserve Dynamic Functions

All function-based properties work identically:

```typescript
// rules - dynamic validation
rules: ({ values }) => {
  const enabled = values.enabled as boolean
  return enabled ? z.string().min(1) : z.string()
}

// visibleWhen - conditional visibility
visibleWhen: ({ values }) => !!(values.enabled as boolean)

// options - dynamic options
options: ({ values }) => {
  const country = values.country as string
  return getStatesForCountry(country)
}

// currencySymbol - dynamic currency
currencySymbol: ({ values }) => {
  const currency = values.baseCurrency as string
  return getCurrencySymbol(currency)
}

// onChange - side effects
onChange: ({ value, values, setValue }) => {
  if (value === 'US') {
    setValue('state', '')
  }
}
```

### 6. Convert Nested Structures

#### Field Groups

```typescript
// OLD
fields: {
  address: {
    type: 'field-group',
    label: 'Address',
    collapsible: true,
    fields: {
      street: { type: 'text', label: 'Street' },
      city: { type: 'text', label: 'City' }
    }
  }
}

// NEW (declare-then-group pattern)
const street = textField('street', { label: 'Street' })
const city = textField('city', { label: 'City' })

const address = fieldGroup('address', {
  label: 'Address',
  collapsible: true,
  fields: { street, city }
})

return { address }
```

#### Tabs

```typescript
// OLD
fields: {
  frequencies: {
    type: 'tabs',
    label: 'Frequencies',
    defaultValue: 'once',
    tabs: [
      {
        value: 'once',
        label: 'One-time',
        fields: {
          amount: { type: 'currency', label: 'Amount' }
        }
      }
    ]
  }
}

// NEW (declare-then-group pattern - for non-trivial tab fields)
const onceAmount = currencyField('amount', { label: 'Amount', min: 1 })
const onceEnabled = toggleField('enabled', { label: 'Enabled' })

const frequencies = tabsField('frequencies', {
  label: 'Frequencies',
  defaultValue: 'once',
  tabs: [
    {
      value: 'once',
      label: 'One-time',
      fields: { enabled: onceEnabled, amount: onceAmount }
    }
  ]
})

return { frequencies }

// For trivial single-field tabs, inline is acceptable:
const frequencies = tabsField('frequencies', {
  tabs: [
    {
      value: 'once',
      label: 'One-time',
      fields: { amount: currencyField('amount', { label: 'Amount' }) }
    }
  ]
})
```

#### Arrays

```typescript
// OLD
fields: {
  presetAmounts: {
    type: 'array',
    label: 'Preset Amounts',
    itemField: { type: 'currency', placeholder: '25', min: 1 },
    sortable: true
  }
}

// NEW
const presetAmounts = arrayField('presetAmounts', {
  label: 'Preset Amounts',
  itemField: currencyField('', { placeholder: '25', min: 1 }),
  sortable: true
})
return { presetAmounts }
```

### 7. Extract Repetitive Patterns (DRY)

When multiple tabs/sections share structure, create helper functions:

```typescript
// Helper function for repeated tab structure
function createFrequencyTabFields(placeholder: string): Record<string, FieldDef> {
  return {
    enabled: toggleField('enabled', { label: 'Enabled' }),
    label: textField('label', {
      label: 'Label',
      placeholder,
      visibleWhen: ({ values }) => !!(values.enabled as boolean)
    }),
    amounts: arrayField('amounts', {
      itemField: currencyField('', { min: 1 }),
      visibleWhen: ({ values }) => !!(values.enabled as boolean)
    })
  }
}

// Use in tabs
const frequencies = tabsField('frequencies', {
  tabs: [
    { value: 'once', label: 'One-time', fields: createFrequencyTabFields('One-time') },
    { value: 'monthly', label: 'Monthly', fields: createFrequencyTabFields('Monthly') }
  ]
})
```

### 8. Return Field Definitions

Return all field definitions as an object (names must match):

```typescript
export const useMyForm = defineForm('myForm', (ctx) => {
  const name = textField('name', { label: 'Name' })
  const email = textField('email', { label: 'Email' })
  const address = fieldGroup('address', { fields: {...} })

  return { name, email, address }  // Variable names = field names
})
```

### 9. Apply DECLARE-THEN-GROUP Pattern (COMMANDMENT #15)

**Always declare fields as individual constants before grouping them.** This improves:

- **Readability**: Each field definition is clearly visible
- **Maintainability**: Easy to modify individual fields
- **Reusability**: Fields can be referenced multiple times
- **Testability**: Individual fields can be tested in isolation

#### ✅ GOOD: Declare then group

```typescript
export const useCheckoutForm = defineForm('checkout', (ctx) => {
  // Declare all fields first
  const formTitle = textField('title', {
    label: 'Form Title',
    rules: z.string().min(5)
  })

  const formSubtitle = textField('subtitle', {
    label: 'Subtitle',
    optional: true
  })

  const supportedCurrencies = comboboxField('supportedCurrencies', {
    label: 'Supported Currencies',
    multiple: true,
    options: CURRENCY_OPTIONS
  })

  const defaultCurrency = comboboxField('defaultCurrency', {
    label: 'Default Currency',
    options: ({ values }) => {
      const supported = values.supportedCurrencies as string[]
      return CURRENCY_OPTIONS.filter((opt) => supported.includes(opt.value))
    }
  })

  // Then group them
  const basicSettings = fieldGroup('basicSettings', {
    label: 'Basic Settings',
    collapsible: true,
    fields: { title: formTitle, subtitle: formSubtitle }
  })

  const currencySettings = fieldGroup('currencySettings', {
    label: 'Currency Settings',
    collapsible: true,
    fields: { supportedCurrencies, defaultCurrency }
  })

  return { basicSettings, currencySettings }
})
```

#### ❌ BAD: Inline field definitions

```typescript
export const useCheckoutForm = defineForm('checkout', (ctx) => {
  // Hard to read, maintain, and reuse
  const basicSettings = fieldGroup('basicSettings', {
    label: 'Basic Settings',
    collapsible: true,
    fields: {
      title: textField('title', {
        label: 'Form Title',
        rules: z.string().min(5)
      }),
      subtitle: textField('subtitle', {
        label: 'Subtitle',
        optional: true
      })
    }
  })

  const currencySettings = fieldGroup('currencySettings', {
    label: 'Currency Settings',
    collapsible: true,
    fields: {
      supportedCurrencies: comboboxField('supportedCurrencies', {
        label: 'Supported Currencies',
        multiple: true,
        options: CURRENCY_OPTIONS
      }),
      defaultCurrency: comboboxField('defaultCurrency', {
        label: 'Default Currency',
        options: ({ values }) => {
          const supported = values.supportedCurrencies as string[]
          return CURRENCY_OPTIONS.filter((opt) => supported.includes(opt.value))
        }
      })
    }
  })

  return { basicSettings, currencySettings }
})
```

#### Exception: Trivial single-line fields

For very simple, single-line field definitions, inline is acceptable:

```typescript
const group = fieldGroup('simple', {
  fields: {
    name: textField('name', { label: 'Name' }),
    age: textField('age', { label: 'Age' })
  }
})
```

## Usage in Components

### FormRenderer

```typescript
// Accepts both old FormDef and new ComposableForm
<FormRenderer v-model="formData" :section="useMyForm" />
```

### Type Hints

```typescript
// For helper functions returning field maps
function createAddressFields(): Record<string, FieldDef> {
  return {
    street: textField('street', {...}),
    city: textField('city', {...})
  }
}
```

## Critical Rules

1. **Field names match variable names**: `const street = textField('street', ...)` ✓
2. **Preserve all dynamic functions**: `rules`, `visibleWhen`, `options`, `onChange`, etc.
3. **Extract repetitive patterns**: Use helper functions for repeated tab/field structures
4. **Keep helpers unchanged**: Utility functions, constants, Zod schemas remain identical
5. **Use type casting for nested values**: `values.enabled as boolean`, `values.pricing as Record<string, unknown>`
6. **Empty field-groups need `fields: {}`**: Even if disabled or placeholder groups
7. **Follow DECLARE-THEN-GROUP pattern** (see CONVENTIONS.md #15): Declare fields as individual constants, then group in containers. Never inline complex field definitions.

## Common Patterns

### Reusable Field Sets

```typescript
// Export helper returning field definitions
export function useAddressFields(): Record<string, FieldDef> {
  const street = textField('street', { label: 'Street' })
  const city = textField('city', { label: 'City' })
  return { street, city }
}

// Use in forms
export const useCheckoutForm = defineForm('checkout', (ctx) => {
  const billingAddress = fieldGroup('billingAddress', {
    label: 'Billing Address',
    fields: useAddressFields()
  })
  return { billingAddress }
})
```

### Conditional Field Groups

```typescript
const shipping = fieldGroup('shipping', {
  label: 'Shipping Address',
  visibleWhen: ({ values }) => !!(values.differentShipping as boolean),
  fields: useAddressFields()
})
```

### Cross-Field Validation

```typescript
const confirmEmail = textField('confirmEmail', {
  label: 'Confirm Email',
  rules: ({ values }) =>
    z
      .string()
      .email()
      .refine((val) => val === values.email, 'Emails must match')
})
```

## Validation

After migration, verify:

- ✅ `pnpm typecheck` passes
- ✅ `pnpm lint:fix` passes
- ✅ `pnpm format:fix` completes
- ✅ Form renders correctly in browser
- ✅ All dynamic behaviors work (visibility, validation, onChange)
