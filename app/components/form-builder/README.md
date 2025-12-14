# Form Builder - Config-driven Form Generator

This form builder implements a **Config-driven Form Generator** pattern for creating maintainable, type-safe configuration forms with minimal code duplication.

## Architecture Overview

The form builder uses a schema-driven approach where:

1. **Zod schemas** define data structure and validation
2. **Field metadata** describes how each field should render
3. **Generic field components** handle rendering based on field type
4. **ConfigSection** wraps everything with vee-validate integration

## Directory Structure

```
app/
├── components/
│   ├── form-builder/
│   │   ├── ConfigSection.vue        # Main section wrapper with accordion
│   │   ├── FormField.vue            # Field type router
│   │   └── fields/
│   │       ├── FormFieldText.vue
│   │       ├── FormFieldTextarea.vue
│   │       ├── FormFieldNumber.vue
│   │       ├── FormFieldToggle.vue
│   │       ├── FormFieldSelect.vue
│   │       ├── FormFieldRadioGroup.vue
│   │       └── FormFieldObject.vue  # Nested fields
│   └── admin/
│       ├── AdminDonationFormConfig.vue      # Main admin form
│       └── AdminTributeConfigBuilder.vue    # Tribute section builder
└── lib/
    └── form-builder/
        ├── types.ts              # Field metadata types
        ├── field-types.ts        # Common vee-validate types
        └── sections/
            └── tribute-config.ts # Tribute section schema + metadata
```

## Key Components

### 1. Field Metadata Types (`lib/form-builder/types.ts`)

Defines how each field should be rendered:

```typescript
interface TextFieldMeta {
  type: 'text'
  label?: string
  description?: string
  placeholder?: string
  optional?: boolean
}

interface ToggleFieldMeta {
  type: 'toggle'
  label?: string
  description?: string
}

interface ObjectFieldMeta {
  type: 'object'
  label?: string
  fields: FieldMetaMap // Nested fields
}
```

### 2. Config Section Definition

Each config section combines a Zod schema with field metadata:

```typescript
export const tributeConfigSection: ConfigSectionDef = {
  id: 'tribute',
  title: 'Tribute Settings',
  description: 'Configure tribute options',
  schema: z.object({
    enabled: z.boolean(),
    icons: z.object({
      gift: z.string().min(1),
      memorial: z.string().min(1)
    })
  }),
  fields: {
    enabled: {
      type: 'toggle',
      label: 'Enable Tribute Feature'
    },
    icons: {
      type: 'object',
      label: 'Icons',
      fields: {
        gift: { type: 'text', label: 'Gift Icon', placeholder: '🎁' },
        memorial: { type: 'text', label: 'Memorial Icon', placeholder: '🕊️' }
      }
    }
  }
}
```

### 3. Generic Field Components

Each field type has a dedicated component that receives:

- `field`: vee-validate field context (value, onChange, onBlur)
- `errors`: validation errors
- `meta`: field metadata (type-specific configuration)
- `name`: field path

Example:

```vue
<FormFieldText :field="field" :errors="errors" :meta="meta" :name="name" />
```

### 4. ConfigSection Component

Wraps a config section with:

- Collapsible/accordion UI
- vee-validate form setup
- Automatic field rendering
- Validation feedback

Usage:

```vue
<ConfigSection
  :section="tributeConfigSection"
  :model-value="config"
  @update:model-value="handleUpdate"
/>
```

## Adding a New Config Section

### Step 1: Define Schema & Metadata

Create `lib/form-builder/sections/your-section-config.ts`:

```typescript
import * as z from 'zod'
import type { ConfigSectionDef } from '@/lib/form-builder/types'

export const yourSectionSchema = z.object({
  enabled: z.boolean(),
  title: z.string().min(1, 'Title is required'),
  maxItems: z.number().min(1).max(100)
})

export const yourSectionConfig: ConfigSectionDef<typeof yourSectionSchema> = {
  id: 'your-section',
  title: 'Your Section Settings',
  description: 'Configure your section',
  schema: yourSectionSchema,
  fields: {
    enabled: {
      type: 'toggle',
      label: 'Enable Feature',
      description: 'Turn this feature on or off'
    },
    title: {
      type: 'text',
      label: 'Section Title',
      placeholder: 'Enter title...'
    },
    maxItems: {
      type: 'number',
      label: 'Maximum Items',
      min: 1,
      max: 100,
      step: 1
    }
  }
}
```

### Step 2: Create Section Builder Component

Create `components/admin/AdminYourSectionBuilder.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import ConfigSection from '@/components/form-builder/ConfigSection.vue'
import { yourSectionConfig } from '@/lib/form-builder/sections/your-section-config'
import type { FormConfig } from '@/lib/common/types'

interface Props {
  modelValue: FormConfig['features']['yourSection']
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: FormConfig['features']['yourSection']]
}>()

const openSection = ref<string | null>('your-section')

const sectionData = computed(() => ({
  enabled: props.modelValue.enabled,
  title: props.modelValue.title,
  maxItems: props.modelValue.maxItems
}))

function handleUpdate(value: typeof sectionData.value) {
  emit('update:modelValue', {
    ...props.modelValue,
    ...value
  })
}
</script>

<template>
  <ConfigSection
    :section="yourSectionConfig"
    :model-value="sectionData"
    :open="openSection === 'your-section'"
    @update:model-value="handleUpdate"
    @update:open="(v) => (openSection = v ? 'your-section' : null)"
  />
</template>
```

### Step 3: Add to Main Admin Form

In `AdminDonationFormConfig.vue`:

```vue
<AdminYourSectionBuilder
  :model-value="config.features.yourSection"
  @update:model-value="(v) => (config.features.yourSection = v)"
/>
```

## Supported Field Types

| Type          | Component           | Use Case              |
| ------------- | ------------------- | --------------------- |
| `text`        | FormFieldText       | Short text input      |
| `textarea`    | FormFieldTextarea   | Multi-line text       |
| `number`      | FormFieldNumber     | Number input with +/- |
| `toggle`      | FormFieldToggle     | Boolean switch        |
| `select`      | FormFieldSelect     | Dropdown/combobox     |
| `radio-group` | FormFieldRadioGroup | Radio button group    |
| `object`      | FormFieldObject     | Nested fields         |

## Conditional Field Visibility

Fields can be shown/hidden based on form values using the `visibleWhen` property:

```typescript
fields: {
  type: {
    type: 'radio-group',
    options: [
      { value: 'none', label: 'None' },
      { value: 'gift', label: 'Gift' }
    ]
  },
  recipientName: {
    type: 'text',
    label: 'Recipient Name',
    visibleWhen: (values) => values.type === 'gift' // Only show when gift is selected
  }
}
```

### Advanced Conditional Logic

```typescript
sendECard: {
  type: 'toggle',
  label: 'Send eCard'
},
sameAsHonoree: {
  type: 'toggle',
  label: 'Send to honoree',
  visibleWhen: (values) => values.sendECard === true && values.type === 'gift'
},
recipientEmail: {
  type: 'text',
  label: 'Email',
  visibleWhen: (values) => values.sendECard === true
}
```

## Two Form Components

### 1. ConfigSection - For Admin Settings

Use `ConfigSection` with accordion/collapsible UI for editing configuration:

```vue
<ConfigSection
  :section="tributeConfigSection"
  :model-value="config"
  @update:model-value="handleUpdate"
/>
```

### 2. FormRenderer - For User Forms

Use `FormRenderer` for regular user-facing forms without accordion:

```vue
<FormRenderer v-model="formData" :section="formSection" @submit="handleSubmit" />
```

## Real-World Example: Tribute Form

The tribute form demonstrates complex conditional logic:

```typescript
export function createTributeFormSection(config) {
  return {
    schema: z
      .object({
        type: z.enum(['none', 'gift', 'memorial']),
        honoreeFirstName: z.string().optional(),
        sendECard: z.boolean(),
        sameAsHonoree: z.boolean().optional(),
        recipientEmail: z.string().optional()
      })
      .superRefine((data, ctx) => {
        // Complex validation based on tribute type
        if (data.type !== 'none' && data.sendECard) {
          if (!data.recipientEmail) {
            ctx.addIssue({ message: 'Email required', path: ['recipientEmail'] })
          }
        }
      }),
    fields: {
      type: {
        type: 'radio-group',
        options: [
          /* ... */
        ]
      },
      honoreeFirstName: {
        type: 'text',
        visibleWhen: (v) => v.type !== 'none'
      },
      sendECard: {
        type: 'toggle',
        visibleWhen: (v) => v.type !== 'none'
      },
      sameAsHonoree: {
        type: 'toggle',
        visibleWhen: (v) => v.type === 'gift' && v.sendECard === true
      },
      recipientEmail: {
        type: 'text',
        visibleWhen: (v) => v.sendECard === true
      }
    }
  }
}
```

## Benefits

✅ **DRY**: One schema definition for types, validation, and UI  
✅ **Type-safe**: Full TypeScript support with inference  
✅ **Scalable**: Add sections by defining schemas, no template duplication  
✅ **Maintainable**: Changes in one place  
✅ **Validated**: Built-in with vee-validate + Zod  
✅ **Reusable**: Field components work across all sections

## Example: Current Implementation

The tribute config section demonstrates all features:

- Toggle for enabling/disabling
- Nested objects for icons and type labels
- Text inputs with placeholders
- Validation with custom error messages

Visit `/admin` to see it in action.
