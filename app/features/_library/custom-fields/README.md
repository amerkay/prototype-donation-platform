# Custom Fields

Add dynamic form fields without code. Admins configure via UI, forms render automatically with validation and conditional logic.

## Overview

**Admin config:**

```typescript
customFields: {
  enabled: true,
  fields: [
    {
      type: 'text',
      id: 'company_name',
      label: 'Company Name',
      optional: true,
      placeholder: 'Acme Inc.'
    }
  ]
}
```

**Runtime usage:**

```vue
<script setup>
import { useCustomFieldsForm } from '~/features/custom-fields/utils'

const section = useCustomFieldsForm(config.customFields.fields)
</script>

<FormRenderer :section="section" v-model="donorData" />
```

## Quick Start

**1. Setup admin form:**

```typescript
import { useCustomFieldsConfigForm } from '~/features/custom-fields/forms/custom-fields-config-form'

const adminForm = useCustomFieldsConfigForm(
  contextSchema, // Optional: external fields for conditions (static or dynamic)
  resolveExternalFields, // Optional: dynamic field resolver
  allowedFieldTypes // Optional: restrict available types (e.g., ['text', 'number'])
)
```

**2. Render runtime form:**

```typescript
import { useCustomFieldsForm } from '~/features/custom-fields/utils'

const userForm = useCustomFieldsForm(config.customFields.fields)
```

**3. Extract defaults (optional):**

```typescript
import { extractCustomFieldDefaults } from '~/features/custom-fields/utils'

const defaults = extractCustomFieldDefaults(config.customFields.fields)
// { company_name: '', team_size: 0, newsletter: false }
// Note: fields with enableVisibilityConditions are skipped (FormField handles their defaults)
```

**4. Check visibility (optional):**

```typescript
import { hasAnyVisibleCustomFields } from '~/features/custom-fields/utils'

// Check if any fields are visible given external context
const show = hasAnyVisibleCustomFields(config.customFields.fields, {
  donorLevel: 'gold',
  country: 'US'
})
// Evaluates conditions in order (supports field-to-field dependencies)
```

## Field Types

| Type            | Use Case              | Key Options                                                | Notes                             |
| --------------- | --------------------- | ---------------------------------------------------------- | --------------------------------- |
| **text**        | Single-line input     | `placeholder`, `maxLength`                                 | Auto-trims whitespace             |
| **textarea**    | Multi-line input      | `placeholder`, `rows`, `maxLength`                         | Default 4 rows                    |
| **number**      | Numeric input         | `min`, `max`, `step`                                       | Enter key submits form            |
| **slider**      | Visual range selector | `min`\*, `max`\*, `step`, `prefix`, `suffix`, `showMinMax` | \*Required fields                 |
| **select**      | Dropdown              | `options[]`\*, `placeholder`                               | Values auto-slugified from labels |
| **radio-group** | Radio buttons         | `options[]`\*, `orientation`                               | Values auto-slugified from labels |
| **checkbox**    | Boolean/multi-select  | `options[]` (optional)                                     | No options = boolean mode         |
| **hidden**      | Tracking data         | `defaultValue`\*                                           | Always excluded from validation   |

All types support `optional` (default: `true`). Options with \* are required.

**Example configs:**

```typescript
// Text field
{ type: 'text', id: 'company', label: 'Company', placeholder: 'Acme Inc.', maxLength: 100 }

// Slider with display
{ type: 'slider', id: 'amount', label: 'Amount', min: 10, max: 1000, step: 10, prefix: '$', showMinMax: true }

// Select with auto-slugified values
{ type: 'select', id: 'country', label: 'Country', options: ['United States', 'Canada', 'Mexico'] }
// Generates: [{ value: 'united_states', label: 'United States' }, ...]

// Checkbox group
{ type: 'checkbox', id: 'interests', label: 'Interests', options: ['Tech', 'Science', 'Art'] }

// Single checkbox (boolean)
{ type: 'checkbox', id: 'newsletter', label: 'Subscribe to newsletter' }
```

## Validation

Automatic validation per field type:

- **Required fields:** `optional: false` → must have value (except hidden fields)
- **Type constraints:** Numbers validate min/max, strings validate maxLength
- **Hidden fields:** Always excluded from validation (use `visibleWhen: () => false`)
- **Conditional fields:** Hidden fields skip validation automatically

Field-specific rules applied via Zod schemas in each factory.

## Visibility Conditions

Control field visibility based on other field values:

**Enable conditions:**

```typescript
{
  type: 'text',
  id: 'other_reason',
  label: 'Please specify',
  enableVisibilityConditions: true,  // ← Required toggle
  visibilityConditions: {
    visibleWhen: {
      match: 'all',  // 'all' | 'any' | 'none'
      conditions: [
        { field: 'reason', operator: 'equals', value: 'other' }
      ]
    }
  }
}
```

**Available operators:**

`contains`, `notContains`, `greaterOrEqual`, `lessOrEqual`, `empty`, `notEmpty`, `isTrue`, `isFalse`, `in`, `notIn`

**Context Schema:**

Pass external fields for cross-form conditions. Can be static or a function that resolves from root form values:

```typescript
// Static schema
const contextSchema = {
  cart_total: { label: 'Cart Total', type: 'number' },
  product_type: { label: 'Product Type', type: 'string', options: [...] }
}

// Dynamic schema (resolves from parent form values)
const contextSchema = (rootValues) => ({
  cart_total: { label: 'Cart Total', type: 'number' },
  ...buildDynamicSchema(rootValues)
})

useCustomFieldsConfigForm(contextSchema)
```

Fields can reference both custom fields (**preceding only** — order matters) and context schema fields.

**Dynamic external fields:**

```typescript
const resolveExternalFields = (rootValues) => {
  const products = rootValues.selectedProducts || []
  return products.map((p) => ({
    key: `product_${p.id}`,
    label: p.name,
    type: 'boolean',
    group: 'Selected Products'
  }))
}

useCustomFieldsConfigForm(contextSchema, resolveExternalFields)
```

## Extending: Add Field Type

**1. Create factory** (`fields/my-field.ts`):

```typescript
export interface MyFieldConfig {
  id: string
  label: string
  optional?: boolean
  myOption: string
}

export function createMyFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    myOption: { type: 'text', label: 'My Option', rules: z.string() }
  }
}

export function myFieldToFieldMeta(config: MyFieldConfig): FieldMeta {
  return {
    type: 'text',
    label: config.label
    // ... convert config to runtime FieldMeta
  }
}

export function getMyFieldDefaultValue(config: MyFieldConfig): string {
  return config.myOption || ''
}

export const myField = {
  createAdminConfig: createMyFieldAdminConfig,
  toFieldMeta: myFieldToFieldMeta,
  getDefaultValue: getMyFieldDefaultValue
}
```

**2. Register in `fields/index.ts`:**

```typescript
import { myField, type MyFieldConfig } from './my-field'

export type { MyFieldConfig }

export const FIELD_FACTORIES = {
  // ... existing
  'my-field': myField
} as const
```

**3. Add to union in `types.ts`:**

```typescript
export type CustomFieldDefinition =
  | ({ type: 'text' } & TextFieldConfig)
  | ({ type: 'my-field' } & MyFieldConfig)
// ...
```

**4. Update config form labels (`forms/custom-fields-config-form.ts`):**

```typescript
const fieldTypeLabels: Record<string, string> = {
  // ... existing
  'my-field': 'My Field (description)'
}
```

See [text-field.ts](./fields/text-field.ts) for reference implementation.

## Gotchas

- **Field IDs auto-generated** from `{type}_{slugified_label}` (max 50 chars) via onChange on the label field
- **Preceding-only references:** Visibility conditions can only reference fields above the current field in the array (enforced by `limitIndex`)
- **Hidden field conditionals:** Visibility conditions on hidden fields control whether the value is _included_ in form data, not UI visibility
- **Auto-clear on hide:** Fields with visibility conditions auto-clear their value when hidden (via `onVisibilityChange`)

## API Reference

**Functions:**

- `useCustomFieldsForm(fields)` → `ComposableForm` — Convert config to runtime form
- `extractCustomFieldDefaults(fields)` → `Record<string, unknown>` — Extract default values (skips conditionally visible fields)
- `hasAnyVisibleCustomFields(fields, externalContext?)` → `boolean` — Check if any fields visible given context
- `useCustomFieldsConfigForm(contextSchema?, resolveExternalFields?, allowedFieldTypes?)` → `ComposableForm` — Create admin config form

**Types:**

- `CustomFieldDefinition` — Discriminated union of all field configs
- `CustomFieldType` — Union of field type strings (`'text' | 'textarea' | 'number' | 'slider' | 'select' | 'radio-group' | 'checkbox' | 'hidden'`)
- `CustomFieldsSettings` — Top-level settings object (`{enabled, fields}`)
- `ContextSchemaInput` — Static `ContextSchema` or `(rootValues) => ContextSchema` for dynamic resolution

**Utilities:**

- `slugify(text, maxLength?)` — Convert to URL-friendly ID
- `extractFieldValue(config, key, default?)` — Safe config value extraction with advancedSettings fallback
- `validateCustomFieldConditions()` — Validate field references after reorder (from form-builder)

## Architecture

**Factory Pattern:** Each field type = isolated module with admin UI generator, runtime converter, and default extractor. Eliminates duplication.

**Dynamic itemField:** Config form uses function-based `itemField` to show/hide options based on selected type. Enables per-type configuration.

**Type Safety:** `CustomFieldDefinition` discriminated union enforces valid properties per type. TypeScript catches config errors at compile time.

**Validation Helpers:** Cross-field validation ensures condition field references remain valid after array reordering.

**Field Extraction:** Converts custom field configs to `AvailableField` format for condition builder integration.

**See Also:** [Form Builder](../form-builder/README.md) · [FormFieldArray](../form-builder/containers/FormFieldArray.vue)
