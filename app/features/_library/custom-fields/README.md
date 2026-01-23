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
import { createCustomFieldsFormSection } from '~/features/custom-fields/utils'

const section = createCustomFieldsFormSection(config.customFields.fields)
</script>

<FormRenderer :section="section" v-model="donorData" />
```

## Quick Start

**1. Setup admin form:**

```typescript
import { createCustomFieldsConfigSection } from '~/features/custom-fields/forms/custom-fields-config-form'

const adminForm = createCustomFieldsConfigSection(
  contextSchema, // Optional: external fields for conditions
  resolveExternalFields, // Optional: dynamic field resolver
  allowedFieldTypes // Optional: restrict available types
)
```

**2. Render runtime form:**

```typescript
import { createCustomFieldsFormSection } from '~/features/custom-fields/utils'

const userForm = createCustomFieldsFormSection(config.customFields.fields)
```

**3. Extract defaults (optional):**

```typescript
import { extractCustomFieldDefaults } from '~/features/custom-fields/utils'

const defaults = extractCustomFieldDefaults(config.customFields.fields)
// { company_name: '', team_size: 0, newsletter: false }
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

`equals`, `notEquals`, `contains`, `notContains`, `startsWith`, `endsWith`, `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`, `in`, `notIn`, `empty`, `notEmpty`

**Context Schema:**

Pass external fields for cross-form conditions:

```typescript
const contextSchema = {
  cart_total: { label: 'Cart Total', type: 'number' },
  product_type: { label: 'Product Type', type: 'string', options: [...] }
}

createCustomFieldsConfigSection(contextSchema)
```

Fields can reference both custom fields (preceding only) and context schema fields.

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

createCustomFieldsConfigSection(contextSchema, resolveExternalFields)
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

## API Reference

**Functions:**

- `createCustomFieldsFormSection(fields)` → `FormDef` — Convert config to runtime form
- `extractCustomFieldDefaults(fields)` → `Record<string, unknown>` — Extract default values
- `createCustomFieldsConfigSection(contextSchema?, resolveExternalFields?, allowedFieldTypes?)` → `FormDef` — Create admin form

**Types:**

- `CustomFieldDefinition` — Discriminated union of all field configs
- `CustomFieldType` — Union of field type strings
- `CustomFieldsSettings` — Top-level settings object (`{enabled, fields}`)

**Utilities:**

- `slugify(text, maxLength?)` — Convert to URL-friendly ID
- `extractFieldValue(config, key, default?)` — Safe config value extraction
- `validateCustomFieldConditions()` — Validate field references after reorder

## Architecture

**Factory Pattern:** Each field type = isolated module with admin UI generator, runtime converter, and default extractor. Eliminates duplication.

**Dynamic itemField:** Config form uses function-based `itemField` to show/hide options based on selected type. Enables per-type configuration.

**Type Safety:** `CustomFieldDefinition` discriminated union enforces valid properties per type. TypeScript catches config errors at compile time.

**Validation Helpers:** Cross-field validation ensures condition field references remain valid after array reordering.

**Field Extraction:** Converts custom field configs to `AvailableField` format for condition builder integration.

**See Also:** [Form Builder](../form-builder/README.md) · [FormFieldArray](../form-builder/containers/FormFieldArray.vue)
