# Form Builder - Config-driven Form Generator

This form builder implements a **Config-driven Form Generator** pattern for creating maintainable, type-safe forms with minimal code duplication. It supports both admin configuration forms (ConfigSection) and user-facing dynamic forms (FormRenderer).

## Architecture Overview

The form builder uses a schema-driven approach where:

1. **Zod schemas** define data structure and validation (optional for dynamic forms)
2. **Field metadata** describes how each field should render
3. **Generic field components** handle rendering based on field type
4. **ConfigSection** wraps admin config forms with collapsible UI and vee-validate
5. **FormRenderer** renders dynamic user-facing forms with conditional field visibility

## Directory Structure

```
app/
├── components/
│   ├── form-builder/
│   │   ├── ConfigSection.vue        # Admin config form wrapper with accordion
│   │   ├── FormRenderer.vue         # Dynamic form renderer for user-facing forms
│   │   ├── FormField.vue            # Field type router with conditional visibility
│   │   └── fields/
│   │       ├── FormFieldText.vue    # Text input (Enter key support)
│   │       ├── FormFieldTextarea.vue
│   │       ├── FormFieldNumber.vue  # Number input (Enter key support)
│   │       ├── FormFieldToggle.vue
│   │       ├── FormFieldSelect.vue  # Combobox with search
│   │       ├── FormFieldRadioGroup.vue
│   │       └── FormFieldObject.vue  # Nested fields
│   └── admin/
│       ├── AdminDonationFormConfig.vue      # Main admin form
│       └── AdminTributeConfigBuilder.vue    # Tribute section builder
├── lib/
│   └── form-builder/
│       ├── types.ts                 # Field metadata types
│       └── sections/
│           ├── tribute-config.ts    # Admin config schema
│           └── tribute-form.ts      # Dynamic user form schema
└── composables/
    └── useScrollOnVisible.ts        # Auto-scroll to newly visible fields
    └── form-builder/
        ├── types.ts              # Field metadata types
        ├── types.ts        # Common vee-validate types
        └── sections/
            └── tribute-config.ts # Tribute section schema + metadata
```

## Key Components

### 1. Field Metadata Types (`lib/form-builder/types.ts`)

All field types extend `BaseFieldMeta`:

```typescript
interface BaseFieldMeta {
  type: FieldType
  label?: string
  description?: string
  placeholder?: string
  optional?: boolean
  visibleWhen?: (values: Record<string, unknown>) => boolean // Conditional visibility
  class?: string // CSS classes (e.g., 'col-span-1' for grid layout)
  rules?: z.ZodTypeAny | ((values: Record<string, unknown>) => z.ZodTypeAny) // Dynamic validation
}

interface TextFieldMeta extends BaseFieldMeta {
  type: 'text'
}

interface NumberFieldMeta extends BaseFieldMeta {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

interface ToggleFieldMeta extends BaseFieldMeta {
  type: 'toggle'
}

interface SelectFieldMeta extends BaseFieldMeta {
  type: 'select'
  options: ReadonlyArray<{ value: string | number; label: string }>
  searchPlaceholder?: string
  notFoundText?: string
}

interface RadioGroupFieldMeta extends BaseFieldMeta {
  type: 'radio-group'
  options: ReadonlyArray<{ value: string | number; label: string; description?: string }>
  orientation?: 'vertical' | 'horizontal'
}

interface ObjectFieldMeta extends BaseFieldMeta {
  type: 'object'
  fields: FieldMetaMap // Nested fields
  legend?: string
  showBorder?: boolean
}
```

### 2. Config Section Definition

Each config section combines a Zod schema (optional) with field metadata:

```typescript
export const tributeConfigSection: ConfigSectionDef = {
  id: 'tribute',
  title: 'Tribute Settings',
  description: 'Configure tribute, gift, and memorial donation options',
  schema: tributeConfigSchema, // Optional - omit for schema-less forms
  fields: {
    enabled: {
      type: 'toggle',
      label: 'Enable Tribute Feature',
      description: 'Allow donors to dedicate donations as gifts or memorials'
    },
    icons: {
      type: 'object',
      label: 'Icons',
      description: 'Emoji icons for different tribute types',
      fields: {
        gift: {
          type: 'text',
          label: 'Gift Icon',
          placeholder: '🎁'
        },
        memorial: {
          type: 'text',
          label: 'Memorial Icon',
          placeholder: '🕊️'
        }
      }
    }
  }
}
```

### 3. Generic Field Components

Each field type has a dedicated component that receives:

- `field`: vee-validate field context (value, onChange, onBlur)
- `errors`: validation errors (only shown when field is touched)
- `meta`: field metadata (type-specific configuration)
- `name`: field path (supports dot notation for nested fields)

All text and number fields support Enter key to submit the form.

### 4. ConfigSection Component (Admin Forms)

Wraps a config section with:

- Collapsible/accordion UI with chevron icon
- vee-validate form setup
- Automatic field rendering
- Visual validation feedback (red border on error)
- Two-way binding with `v-model`

Usage:

```vue
<ConfigSection
  :section="tributeConfigSection"
  :model-value="tributeConfig"
  :open="openSection === 'tribute'"
  @update:model-value="handleTributeUpdate"
  @update:open="(v) => handleOpenChange('tribute', v)"
/>
```

### 5. FormRenderer Component (User-Facing Forms)

Dynamic form renderer with:

- Conditional field visibility with auto-scroll to newly visible fields
- Smart grid layout (consecutive `col-span-1` fields grouped in 2-column grid)
- Enter key support for form submission
- Form validation with exposed `isValid` computed property
- Emits `submit` event on form submission

Usage:

```vue
<script setup lang="ts">
const formSection = computed(() => createTributeFormSection(props.config))
const formValues = ref({
  type: 'none',
  honoreeFirstName: '',
  sendECard: false
})

function handleSubmit() {
  console.log('Form submitted:', formValues.value)
}
</script>

<template>
  <FormRenderer ref="formRef" :section="formSection" v-model="formValues" @submit="handleSubmit" />
</template>
```

## Adding a New Admin Config Section

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
  description: 'Configure your feature',
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
      description: 'Maximum number of items to display',
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
import ConfigSection from '@/features/form-builder/ConfigSection.vue'
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

// Extract the subset that matches our schema
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

function handleOpenChange(sectionId: string, isOpen: boolean) {
  openSection.value = isOpen ? sectionId : null
}
</script>

<template>
  <div class="space-y-2">
    <ConfigSection
      :section="yourSectionConfig"
      :model-value="sectionData"
      :open="openSection === 'your-section'"
      @update:model-value="handleUpdate"
      @update:open="(v) => handleOpenChange('your-section', v)"
    />
  </div>
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

## Creating Dynamic User-Facing Forms

Dynamic forms use `FormRenderer` with conditional field visibility and auto-scroll.

### Step 1: Create Form Section Function

Create `lib/form-builder/sections/your-form.ts`:

```typescript
import * as z from 'zod'
import type { ConfigSectionDef } from '@/lib/form-builder/types'
import type { FormConfig } from '@/lib/common/types'

/**
 * Create dynamic form section from config
 * No schema required - use field-level validation with rules
 */
export function createYourFormSection(
  config: FormConfig['features']['yourFeature']
): ConfigSectionDef {
  return {
    id: 'your-form',
    title: config.modal.title,
    description: config.modal.subtitle,
    fields: {
      type: {
        type: 'radio-group',
        label: 'Choose Type',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]
      },
      // Conditionally visible field - 2-column grid
      firstName: {
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter first name',
        class: 'col-span-1', // Groups with other col-span-1 fields
        visibleWhen: (values) => values.type !== 'option1',
        rules: z.string().min(2, 'First name must be at least 2 characters')
      },
      lastName: {
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter last name',
        class: 'col-span-1', // Groups with firstName
        optional: true,
        visibleWhen: (values) => values.type !== 'option1'
      },
      // Dynamic validation based on form values
      email: {
        type: 'text',
        label: 'Email',
        placeholder: 'you@example.com',
        visibleWhen: (values) => values.sendEmail === true,
        rules: (values) => {
          // Only required when sendEmail is true
          if (values.sendEmail) {
            return z.string().email('Invalid email')
          }
          return z.string().optional()
        }
      },
      sendEmail: {
        type: 'toggle',
        label: 'Send email notification',
        description: 'Notify via email when complete'
      },
      relationship: {
        type: 'select',
        label: 'Relationship',
        placeholder: 'Select relationship',
        optional: true,
        options: config.relationships.map((r) => ({
          value: r.value,
          label: r.label
        })),
        searchPlaceholder: 'Search relationships...',
        notFoundText: 'No relationship found',
        visibleWhen: (values) => values.type === 'option2'
      }
    }
  }
}
```

### Step 2: Use FormRenderer in Component

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import { createYourFormSection } from '@/lib/form-builder/sections/your-form'
import type { FormConfig } from '@/lib/common/types'

interface Props {
  modelValue?: YourDataType
  config: FormConfig['features']['yourFeature']
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: YourDataType]
  submit: []
}>()

// Create form section from config
const formSection = computed(() => createYourFormSection(props.config))

// Convert data model to flat form values
const formValues = ref({
  type: props.modelValue?.type ?? 'option1',
  firstName: props.modelValue?.firstName ?? '',
  lastName: props.modelValue?.lastName ?? '',
  email: props.modelValue?.email ?? '',
  sendEmail: props.modelValue?.sendEmail ?? false,
  relationship: props.modelValue?.relationship ?? ''
})

// Watch form values and emit structured data
watch(
  formValues,
  (current) => {
    const data: YourDataType = {
      type: current.type,
      firstName: current.firstName,
      lastName: current.lastName
    }

    if (current.sendEmail) {
      data.email = current.email
    }

    emit('update:modelValue', data)
  },
  { deep: true }
)

function handleSubmit() {
  emit('submit')
}
</script>

<template>
  <FormRenderer :section="formSection" v-model="formValues" @submit="handleSubmit" />
</template>
```

## Supported Field Types

| Type          | Component           | Features                                  |
| ------------- | ------------------- | ----------------------------------------- |
| `text`        | FormFieldText       | Text input, Enter key submits             |
| `textarea`    | FormFieldTextarea   | Multi-line text                           |
| `number`      | FormFieldNumber     | Number input with +/-, Enter key submits  |
| `toggle`      | FormFieldToggle     | Boolean switch                            |
| `select`      | FormFieldSelect     | Searchable combobox dropdown              |
| `radio-group` | FormFieldRadioGroup | Radio button group (vertical/horizontal)  |
| `object`      | FormFieldObject     | Nested fields with optional border/legend |

## Advanced Features

### 1. Conditional Field Visibility

Fields dynamically show/hide based on form state with auto-scroll to newly visible fields:

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
  },
  sameAsHonoree: {
    type: 'toggle',
    label: 'Send to honoree',
    // Multiple conditions
    visibleWhen: (values) => values.sendECard === true && values.type === 'gift'
  }
}
```

### 2. Dynamic Validation Rules

Validation rules can be functions that access current form values:

```typescript
recipientEmail: {
  type: 'text',
  label: 'Email',
  visibleWhen: (values) => values.sendECard === true,
  rules: (values) => {
    // Different validation based on form state
    if (values.sendECard) {
      return z.string()
        .min(1, 'Email is required')
        .email('Invalid email')
    }
    return z.string().optional()
  }
}
```

### 3. Smart Grid Layout

Consecutive fields with `class: 'col-span-1'` are automatically grouped in a 2-column grid:

```typescript
fields: {
  // These two fields will be in a 2-column grid
  firstName: {
    type: 'text',
    label: 'First Name',
    class: 'col-span-1'
  },
  lastName: {
    type: 'text',
    label: 'Last Name',
    class: 'col-span-1'
  },
  // This field will be full width (no col-span-1)
  email: {
    type: 'text',
    label: 'Email'
  }
}
```

### 4. Auto-Scroll to Visible Fields

When fields become visible (via `visibleWhen`), FormRenderer automatically scrolls to them using the `useScrollOnVisible` composable with configurable delay and offset.

### 5. Field-Level vs Schema-Level Validation

**Field-level** (recommended for dynamic forms):

```typescript
fields: {
  firstName: {
    type: 'text',
    rules: z.string().min(2, 'Too short')
  }
}
```

**Schema-level** (for complex cross-field validation):

```typescript
{
  schema: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2)
  }).refine((data) => data.firstName !== data.lastName, {
    message: "Names can't match"
  })
}
```

## Real-World Example: Tribute Form

See `lib/form-builder/sections/tribute-form.ts` for a complete example demonstrating:

- Radio group for tribute type selection
- Conditional honoree fields (name, relationship)
- eCard toggle with nested recipient fields
- "Same as honoree" toggle that auto-fills recipient info
- Dynamic email validation (required only when eCard is enabled)
- 2-column grid layout for name fields
- Select dropdown with search for relationships

## ConfigSection vs FormRenderer

| Feature             | ConfigSection         | FormRenderer          |
| ------------------- | --------------------- | --------------------- |
| Use Case            | Admin settings        | User-facing forms     |
| UI                  | Collapsible accordion | Plain form            |
| Schema Required     | Yes (recommended)     | No (field-level only) |
| Auto-scroll         | No                    | Yes                   |
| Submit Event        | No                    | Yes                   |
| Validation Feedback | Border color          | Inline errors         |
| Open/Close State    | Yes                   | No                    |

## Benefits

✅ **DRY**: Define once, render everywhere  
✅ **Type-safe**: Full TypeScript with Zod inference  
✅ **Maintainable**: Config-driven, single source of truth  
✅ **User-friendly**: Auto-scroll, conditional fields, smart layouts  
✅ **Validated**: vee-validate + Zod with field/schema-level rules  
✅ **Reusable**: Generic field components work across all forms  
✅ **Flexible**: Support both admin config and dynamic user forms
