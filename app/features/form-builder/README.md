# Form Builder - Config-Driven Forms

A type-safe, declarative form builder for creating dynamic forms with validation, conditional visibility, and minimal boilerplate.

## Core Concepts

Forms are defined using **field metadata** objects that describe structure, validation, and behavior:

```typescript
const formSection: ConfigSectionDef = {
  id: 'my-form',
  title: 'Contact Information',
  fields: {
    name: {
      type: 'text',
      label: 'Full Name',
      placeholder: 'John Doe',
      rules: z.string().min(2, 'Name required')
    },
    email: {
      type: 'text',
      label: 'Email',
      rules: z.string().email('Valid email required')
    },
    subscribe: {
      type: 'toggle',
      label: 'Subscribe to newsletter',
      optional: true
    }
  }
}
```

Render with `FormRenderer`:

```vue
<FormRenderer :section="formSection" v-model="formData" @submit="handleSubmit" />
```

## Field Types

| Type          | Purpose                          | Key Props                        |
| ------------- | -------------------------------- | -------------------------------- |
| `text`        | Single-line text input           | `placeholder`                    |
| `textarea`    | Multi-line text                  | `rows`                           |
| `number`      | Number input with +/- buttons    | `min`, `max`, `step`             |
| `toggle`      | Boolean switch                   | -                                |
| `select`      | Dropdown with search             | `options`, `searchPlaceholder`   |
| `radio-group` | Radio button group               | `options`, `orientation`         |
| `emoji`       | Emoji input (validated)          | `maxLength`                      |
| `field-group` | Groups fields (supports nesting) | `fields`, `class`, `collapsible` |
| `array`       | Dynamic list of items            | `itemField`, `addButtonText`     |
| `card`        | Info display (non-input)         | -                                |

## Common Field Properties

All field types support:

```typescript
{
  label?: string                    // Field label
  labelClass?: string                // Label styling
  class?: string                     // Input element styling
  description?: string | (values) => string  // Help text (can be dynamic)
  placeholder?: string               // Placeholder text
  optional?: boolean                 // Shows "(optional)" badge
  rules?: ZodSchema | (values) => ZodSchema  // Validation (dynamic)
  visibleWhen?: (values) => boolean  // Conditional visibility
  onChange?: (value, allValues, setValue) => void  // Change handler
  isNoSeparatorAfter?: boolean      // Skip separator after field
}
```

## Key Features

### 1. Conditional Visibility

Fields auto-show/hide based on form values. Hidden fields skip validation:

```typescript
fields: {
  type: {
    type: 'radio-group',
    options: [
      { value: 'personal', label: 'Personal' },
      { value: 'business', label: 'Business' }
    ]
  },
  companyName: {
    type: 'text',
    label: 'Company Name',
    visibleWhen: (values) => values.type === 'business',
    rules: z.string().min(1, 'Required')
  }
}
```

### 2. onChange Callbacks

React to field changes to update other fields:

```typescript
sendEmail: {
  type: 'toggle',
  label: 'Send email notification',
  onChange: (value, allValues, setValue) => {
    if (value === false) {
      setValue('emailAddress', '')  // Clear email when disabled
    }
  }
}
```

### 3. Nested Field Groups

Group related fields with grid layouts:

```typescript
address: {
  type: 'field-group',
  label: 'Address',
  class: 'grid grid-cols-2 gap-x-3',  // Applied to container
  fields: {
    street: { type: 'text', label: 'Street' },
    city: { type: 'text', label: 'City' },
    zip: { type: 'text', label: 'ZIP' },
    country: { type: 'select', label: 'Country', options: [...] }
  }
}
```

**Accessing nested values in onChange:**

```typescript
// Field-group values are nested objects
onChange: (value, allValues, setValue) => {
  const address = allValues.address as Record<string, unknown>
  const city = address?.city as string

  // Set nested value
  setValue('address.city', 'New York')
}
```

### 4. Collapsible Field Groups

Create accordion-style forms for admin panels:

```typescript
advanced: {
  type: 'field-group',
  label: 'Advanced Settings',
  collapsible: true,
  collapsibleDefaultOpen: false,
  badgeLabel: 'Optional',
  badgeVariant: 'secondary',
  fields: { /* ... */ }
}
```

### 5. Dynamic Arrays

Let users add/remove items:

```typescript
tags: {
  type: 'array',
  label: 'Tags',
  addButtonText: 'Add Tag',
  itemField: {
    type: 'text',
    placeholder: 'Enter tag'
  }
}
```

### 6. Dynamic Validation & Descriptions

Validation rules and descriptions can be functions:

```typescript
phone: {
  type: 'text',
  label: 'Phone',
  description: (values) =>
    values.country === 'US'
      ? 'Format: (555) 123-4567'
      : 'Include country code',
  rules: (values) =>
    values.country === 'US'
      ? z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/)
      : z.string().min(1)
}
```

### 7. Styling

Apply Tailwind classes to elements:

```typescript
email: {
  type: 'text',
  label: 'Email Address',
  labelClass: 'font-bold text-lg',  // Applied to <label>
  class: 'font-mono',                // Applied to <input>
  classDescription: 'text-blue-600'  // Applied to description
}
```

### 8. Reusable Field Sets

Extract repeated fields into factory functions that return `FieldMetaMap`:

```typescript
// app/features/donation-form/forms/message-fields.ts
import type { FieldMetaMap } from '~/features/form-builder/form-builder-types'

export function createMessageFields(
  visibilityCondition?: (values: Record<string, unknown>) => boolean
): FieldMetaMap {
  return {
    isIncludeMessage: {
      type: 'toggle',
      label: 'Include a Message',
      optional: true,
      visibleWhen: visibilityCondition,
      isNoSeparatorAfter: true
    },
    message: {
      type: 'textarea',
      label: 'Your Message',
      maxLength: 250,
      visibleWhen: (values: Record<string, unknown>) => {
        if (visibilityCondition && !visibilityCondition(values)) return false
        return values.isIncludeMessage === true
      },
      rules: (values: Record<string, unknown>) =>
        values.isIncludeMessage === true ? z.string().max(250) : z.string().optional()
    }
  }
}
```

Usage - spread into fields:

```typescript
fields: {
  email: { type: 'text', label: 'Email' },
  ...createMessageFields((values) => values.sendEmail === true)
}
```

## Complete Example

```typescript
import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

export const contactFormSection: ConfigSectionDef = {
  id: 'contact-form',
  title: 'Contact Us',
  description: "We'll get back to you within 24 hours",
  fields: {
    contactType: {
      type: 'radio-group',
      label: 'I need help with',
      options: [
        { value: 'support', label: 'Technical Support' },
        { value: 'sales', label: 'Sales Inquiry' },
        { value: 'other', label: 'Other' }
      ]
    },

    personalInfo: {
      type: 'field-group',
      class: 'grid grid-cols-2 gap-x-3',
      fields: {
        firstName: {
          type: 'text',
          label: 'First Name',
          rules: z.string().min(2)
        },
        lastName: {
          type: 'text',
          label: 'Last Name',
          rules: z.string().min(2)
        }
      }
    },

    email: {
      type: 'text',
      label: 'Email',
      rules: z.string().email()
    },

    message: {
      type: 'textarea',
      label: 'Message',
      rows: 5,
      rules: z.string().min(10, 'Please provide more details')
    },

    subscribe: {
      type: 'toggle',
      label: 'Subscribe to updates',
      description: 'Get notified about new features',
      optional: true
    }
  }
}
```

Usage:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { contactFormSection } from './contact-form'

const formData = ref({})

async function handleSubmit() {
  console.log('Form submitted:', formData.value)
  // API call here
}
</script>

<template>
  <FormRenderer :section="contactFormSection" v-model="formData" @submit="handleSubmit" />
</template>
```

## FormRenderer Props & Events

**Props:**

- `section: ConfigSectionDef` - Form configuration
- `modelValue: Record<string, unknown>` - Form values (v-model)
- `class?: string` - Form element classes

**Events:**

- `update:modelValue` - Emitted on any field change
- `submit` - Emitted on form submission (Enter key or explicit call)

**Exposed:**

- `isValid: boolean` - Current validation state
- `onSubmit: () => void` - Trigger form submission

## Best Practices

1. **Keep field-group values nested** - Access with `allValues.groupName.fieldName`
2. **Use visibleWhen for progressive disclosure** - Better UX than showing all fields
3. **Make validation dynamic when needed** - Rules can adapt to other field values
4. **Use onChange sparingly** - Only for cross-field logic, not simple state changes
5. **Leverage field-groups for layout** - Apply grid classes to `class` prop
6. **Add isNoSeparatorAfter for tight spacing** - Remove separator between related fields
7. **Extract reusable field sets** - Use factory functions for repeated patterns (see Key Features #8)
