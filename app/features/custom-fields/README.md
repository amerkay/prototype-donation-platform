# Custom Fields - Field Factory Pattern

## Overview

The custom fields system uses **field-specific factory modules** to define, configure, and render dynamic form fields. Each field type (text, slider, select, etc.) has its own self-contained factory module that handles:

1. **Admin Configuration** - UI for configuring the field in the admin panel
2. **Runtime Conversion** - Converting admin config to form-builder FieldMeta
3. **Default Values** - Extracting default values for form initialization

## Architecture

### Key Concepts

**Factory Module** (`fields/text-field.ts`, `fields/slider-field.ts`, etc.)

- Single source of truth for each field type
- Co-locates admin config, runtime conversion, and validation
- Exports unified factory object with 3 methods

**Dynamic itemField Resolution** (`FormFieldArray.vue`)

- Array fields can now accept **functions** for `itemField`
- Function receives current item values and returns FieldMeta
- Enables dynamic UI based on selected field type

**Type Safety** (`types.ts`)

- Discriminated union for CustomFieldDefinition
- Each field type has its own config interface
- TypeScript enforces correct structure at compile-time

## Directory Structure

```
app/features/custom-fields/
├── fields/                       # Field factory modules
│   ├── field-base.ts             # Shared utilities for all factories
│   ├── text-field.ts             # Text field factory
│   ├── textarea-field.ts         # Textarea field factory
│   ├── slider-field.ts           # Slider field factory
│   ├── select-field.ts           # Select field factory
│   ├── hidden-field.ts           # Hidden field factory
│   └── index.ts                  # Barrel export + FIELD_FACTORIES registry
├── forms/
│   └── custom-fields-config-form.ts  # Admin config form (uses factories)
├── types.ts                      # TypeScript type definitions
├── utils.ts                      # Converter utilities (uses factories)
└── CustomFieldsConfigurator.vue  # Admin UI component
```

## Factory Pattern

### Factory Interface

Each factory exports an object implementing this interface:

```typescript
interface AdminConfigFactory<TConfig> {
  // Generate admin config UI for this field type
  createAdminConfig: () => Record<string, FieldMeta>

  // Convert admin config to runtime FieldMeta
  toFieldMeta: (config: TConfig) => FieldMeta

  // Extract default value from config
  getDefaultValue: (config: TConfig) => unknown
}
```

### Example: Text Field Factory

```typescript
// text-field.ts
export interface TextFieldConfig {
  id: string
  label: string
  optional?: boolean
  defaultValue?: string
  placeholder?: string
  maxLength?: number
}

export function createTextFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    placeholder: {
      type: 'text',
      label: 'Placeholder',
      optional: true,
      rules: z.string().optional()
    },
    maxLength: {
      type: 'number',
      label: 'Maximum Length',
      min: 1,
      max: 10000,
      optional: true,
      rules: z.number().min(1).max(10000).optional()
    },
    optional: {
      type: 'toggle',
      label: 'Optional',
      defaultValue: true,
      rules: z.boolean().optional()
    },
    defaultValue: {
      type: 'text',
      label: 'Default Value',
      optional: true,
      rules: z.string().optional()
    }
  }
}

export function textFieldToFieldMeta(config: TextFieldConfig): FieldMeta {
  const optional = config.optional ?? true
  return {
    type: 'text',
    label: config.label,
    placeholder: config.placeholder,
    maxLength: config.maxLength,
    defaultValue: config.defaultValue ?? '',
    rules: optional ? z.string().optional() : z.string().min(1, `${config.label} is required`)
  }
}

export function getTextFieldDefaultValue(config: TextFieldConfig): string {
  return config.defaultValue ?? ''
}

export const textField = {
  createAdminConfig: createTextFieldAdminConfig,
  toFieldMeta: textFieldToFieldMeta,
  getDefaultValue: getTextFieldDefaultValue
}
```

## Dynamic itemField Resolution

### Before (Static)

```typescript
fields: {
  type: 'array',
  itemField: {
    type: 'field-group',
    fields: {
      // Static fields - can't change based on item values
    }
  }
}
```

### After (Dynamic with Function)

```typescript
fields: {
  type: 'array',
  itemField: (values: Record<string, unknown>) => {
    const type = values.type as 'text' | 'slider' | 'select'

    // Build fields dynamically based on selected type
    const fields: Record<string, FieldMeta> = {
      type: { /* ... */ },
      label: { /* ... */ }
    }

    // Load type-specific config from factory
    if (type && type in FIELD_FACTORIES) {
      const factory = FIELD_FACTORIES[type]
      Object.assign(fields, factory.createAdminConfig())
    }

    return {
      type: 'field-group',
      label: `${type}: ${values.label}`,
      fields
    }
  }
}
```

## Usage Examples

### Creating the Admin Form

```typescript
import { createCustomFieldsConfigSection } from './forms/custom-fields-config-form'

const configSection = createCustomFieldsConfigSection()
// Returns FormDef with dynamic itemField that resolves per-array-item
```

### Converting Admin Config to Runtime Form

```typescript
import { createCustomFieldsFormSection } from './utils'
import type { CustomFieldDefinition } from './types'

const customFields: CustomFieldDefinition[] = [
  {
    type: 'text',
    id: 'company_name',
    label: 'Company Name',
    placeholder: 'Enter company name',
    optional: true
  },
  {
    type: 'slider',
    id: 'involvement_level',
    label: 'How involved do you want to be?',
    min: 0,
    max: 100,
    suffix: '%',
    optional: false
  }
]

const formSection = createCustomFieldsFormSection(customFields)
// Converts using FIELD_FACTORIES[type].toFieldMeta()
```

### Extracting Default Values

```typescript
import { extractCustomFieldDefaults } from './utils'

const defaults = extractCustomFieldDefaults(customFields)
// Uses FIELD_FACTORIES[type].getDefaultValue()
// Returns: { company_name: '', involvement_level: 0 }
```

## Adding a New Field Type

1. **Create Factory Module** (`fields/my-field.ts`)

```typescript
export interface MyFieldConfig {
  id: string
  label: string
  // ... type-specific properties
}

export function createMyFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    // Admin UI fields
  }
}

export function myFieldToFieldMeta(config: MyFieldConfig): FieldMeta {
  return {
    type: 'my-field',
    label: config.label
    // ... runtime properties
  }
}

export function getMyFieldDefaultValue(config: MyFieldConfig): unknown {
  return config.defaultValue ?? null
}

export const myField = {
  createAdminConfig: createMyFieldAdminConfig,
  toFieldMeta: myFieldToFieldMeta,
  getDefaultValue: getMyFieldDefaultValue
}
```

2. **Register in `fields/index.ts`**

```typescript
export { myField, type MyFieldConfig } from './my-field'

export const FIELD_FACTORIES = {
  text: textField,
  textarea: textareaField,
  slider: sliderField,
  select: selectField,
  hidden: hiddenField,
  'my-field': myField // Add here
} as const
```

3. **Update Types** (`types.ts`)

```typescript
export type CustomFieldDefinition =
  | ({ type: 'text' } & TextFieldConfig)
  | ({ type: 'textarea' } & TextareaFieldConfig)
  | ({ type: 'slider' } & SliderFieldConfig)
  | ({ type: 'select' } & SelectFieldConfig)
  | ({ type: 'hidden' } & HiddenFieldConfig)
  | ({ type: 'my-field' } & MyFieldConfig) // Add here
```

4. **Add to Type Select** (`custom-fields-config-form.ts`)

```typescript
type: {
  type: 'select',
  label: 'Field Type',
  options: [
    { value: 'text', label: 'Text (single line)' },
    { value: 'textarea', label: 'Textarea (multi-line)' },
    { value: 'slider', label: 'Slider (number range)' },
    { value: 'select', label: 'Dropdown (select options)' },
    { value: 'hidden', label: 'Hidden (tracking field)' },
    { value: 'my-field', label: 'My Custom Field' }  // Add here
  ]
}
```

That's it! The factory pattern handles everything else automatically.

## Benefits of This Approach

✅ **DRY** - No duplication between admin config and runtime logic  
✅ **Type-Safe** - TypeScript enforces correct structure  
✅ **Maintainable** - Each field type is self-contained in one file  
✅ **Extensible** - Adding new field types is straightforward  
✅ **Dynamic** - itemField as function enables runtime UI changes  
✅ **Testable** - Each factory can be unit tested independently  
✅ **Co-located** - Config, validation, and conversion live together

## Migration from V2 (Type-Scoped Configs)

### Old Structure (V2)

```typescript
interface CustomFieldDefinition {
  id: string
  type: 'text' | 'slider' | 'select'
  label: string
  textConfig?: {
    /* ... */
  }
  sliderConfig?: {
    /* ... */
  }
  selectConfig?: {
    /* ... */
  }
}
```

### New Structure (V3)

```typescript
type CustomFieldDefinition =
  | ({ type: 'text' } & TextFieldConfig)
  | ({ type: 'slider' } & SliderFieldConfig)
  | ({ type: 'select' } & SelectFieldConfig)
```

The new approach flattens the config structure and uses discriminated unions for type safety. No more nested `textConfig`/`sliderConfig` objects—config properties are at the top level.

## Related Documentation

- [Form Builder README](../form-builder/README.md) - Core form builder system
- [FormFieldArray](../form-builder/fields/FormFieldArray.vue) - Array field implementation
- [Field Types](../form-builder/types.ts) - FieldMeta type definitions
