# Custom Fields

Add dynamic form fields to your forms without writing code. Admins configure, users fill out—no developer intervention needed.

## Overview

**What admins configure:**

Enable custom fields, add a text input for "Company Name", make it optional:

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

**What users see:**

Form automatically renders with validation, conditional logic, and proper accessibility:

```vue
<FormRenderer :section="customFieldsSection" v-model="donorData" />
```

## Quick Start

**Step 1:** Enable custom fields in admin UI

**Step 2:** Use the visual configurator to add fields—select type, set label, configure options. The admin UI generates the config structure automatically.

**Step 3:** Form renders the fields:

```typescript
import { createCustomFieldsFormSection } from '~/features/custom-fields/utils'

const formSection = createCustomFieldsFormSection(config.customFields.fields)
```

```vue
<FormRenderer :section="formSection" v-model="donorData" />
```

No code changes needed—admins configure everything through the UI.

## Available Field Types

The admin UI generates these config structures. Examples show the generated output:

| Type            | Use Case                    | Key Options                      |
| --------------- | --------------------------- | -------------------------------- |
| **text**        | Single-line input           | `placeholder`, `maxLength`       |
| **textarea**    | Multi-line input            | `rows`, `maxLength`              |
| **number**      | Numeric input               | `min`, `max`, `step`             |
| **slider**      | Visual range selector       | `min`, `max`, `prefix`, `suffix` |
| **select**      | Dropdown                    | `options[]`, `placeholder`       |
| **radio-group** | Radio buttons (2-5 options) | `options[]`, `orientation`       |
| **checkbox**    | Boolean or multi-select     | `options[]` (omit for single)    |
| **hidden**      | Tracking data               | `defaultValue`                   |

**Example generated config:**

```typescript
// Admin selects "Text" type, fills in label and options
// Generator creates:
{
  type: 'text',
  id: 'company_name',
  label: 'Company Name',
  placeholder: 'Acme Inc.',
  optional: true
}
```

All types support `optional` (default: `true`) and `defaultValue`.

## Configuration & Validation

Validation is automatic:

- Required fields (`optional: false`) must have values
- Type/range/length constraints enforced per field type
- Error messages generated from config

## Advanced Features

**Visibility Conditions:** Show/hide fields based on other values. Operators: `equals`, `contains`, `greater_than`, `is_empty`, etc.

**Context Schema:** Pass external data (products, cart state) to make fields conditional on app state.

**Default Values:**

```typescript
import { extractCustomFieldDefaults } from '~/features/custom-fields/utils'

const defaults = extractCustomFieldDefaults(config.fields)
// { company_name: '', team_size: 0, ... }
```

## Extending: Add Field Types

4 steps to add a new field type:

1. **Create factory** (`fields/my-field.ts`) with `createAdminConfig()`, `toFieldMeta()`, `getDefaultValue()`
2. **Register** in `FIELD_FACTORIES` (`fields/index.ts`)
3. **Add type** to `CustomFieldDefinition` union (`types.ts`)
4. **Add option** to type selector (`forms/custom-fields-config-form.ts`)

See existing fields like [text-field.ts](./fields/text-field.ts) for reference. Factory pattern handles UI generation and conversion automatically.

## Architecture

**Factory Pattern:** Each field type = one factory file with admin config, runtime conversion, and defaults. Avoids duplication.

**Dynamic itemField:** Admin UI uses function-based `itemField` to show/hide options based on selected type.

**Type Safety:** Discriminated union (`CustomFieldDefinition`) enforces valid properties per type.

**See Also:** [Form Builder](../form-builder/README.md) · [FormFieldArray](../form-builder/fields/FormFieldArray.vue) · [Conditions](../form-builder/conditions/README.md)
