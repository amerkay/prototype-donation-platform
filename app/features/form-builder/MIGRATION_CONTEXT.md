# FieldContext Pattern

## Standard: Always Destructure

All dynamic field functions receive `FieldContext` and **must use destructuring**:

```typescript
interface FieldContext {
  values: Record<string, unknown> // Current scope's values
  parent?: Record<string, unknown> // Parent container's values
  root: Record<string, unknown> // Root form values
  value?: unknown // Current field's new value (only in onChange)
  setValue?: SetFieldValueFn // Set field values (only in onChange)
}
```

## Pattern

```typescript
// ✅ Destructure what you use
visibleWhen: ({ values }) => values.enabled === true
disabled: ({ values }) => values.locked === true
rules: ({ values }) => z.string().min(values.minLength as number)
onChange: ({ value, values, setValue }) => setValue('other', values.x)

// ✅ Multiple properties
min: ({ values, parent }) => (values.override as number) ?? (parent?.min as number) ?? 0

// ✅ No context needed - omit parameter
visibleWhen: () => true
rules: () => z.string().min(5)

// ❌ Never use ctx parameter
visibleWhen: (ctx) => ctx.values.enabled === true
```

## Affected Properties

- `visibleWhen: ({ values }) => boolean`
- `rules: ({ values }) => ZodSchema`
- `disabled: ({ values }) => boolean`
- `options: ({ values }) => Option[]`
- `label/description/placeholder: ({ values }) => string`
- `onChange: ({ value, values, setValue }) => unknown`
- Field-specific: `min/max/step: ({ parent }) => number`, `currencySymbol: ({ values }) => string`

## Migration

**Before:**

```typescript
visibleWhen: (ctx) => ctx.values.enabled === true
rules: (ctx) => (ctx.values.min ? z.string() : z.optional())
onChange: (value, ctx, setValue) => {
  const otherValue = ctx.values.other
  setValue('field', otherValue)
}
```

**After:**

```typescript
visibleWhen: ({ values }) => values.enabled === true
rules: ({ values }) => (values.min ? z.string() : z.optional())
onChange: ({ value, values, setValue }) => {
  const otherValue = values.other
  setValue('field', otherValue)
}
```

## Why Destructuring

1. **Explicit dependencies** - See what each function uses at a glance
2. **Shorter code** - No `ctx.` prefix everywhere
3. **Better DX** - IDE autocomplete works better
4. **Cleaner** - No underscore prefixes for unused parameters

5. **Maintainability**: Easy to understand and refactor
6. **Debuggability**: Context object is inspectable and understandable

## Breaking Changes

⚠️ **All custom field configurations must update function signatures to use destructuring**

**onChange signature changed from three parameters to one unified context:**

- Old: `onChange: (value, ctx, setValue) => void`
- New: `onChange: ({ value, values, setValue }) => void`

This affects any project using the form builder with custom:

- onChange callbacks (unified context parameter)
- Visibility conditions (`visibleWhen`)
- Validation rules (`rules`)
- Dynamic options (`options`)
- Dynamic labels/placeholders
- Custom field properties

## Example Migration

```typescript
// ❌ Before
const myFormConfig = {
  fields: {
    conditional: {
      type: 'text',
      visibleWhen: (values) => values.showField === true,
      rules: (values) => (values.required ? z.string().min(1) : z.string().optional())
    },
    nestedField: {
      type: 'slider',
      min: (values) => (values.__parent?.minValue as number) ?? 0,
      max: (values) => (values.__parent?.maxValue as number) ?? 100
    },
    dynamicOptions: {
      type: 'select',
      options: (values) => {
        const category = values.category as string
        return getOptionsForCategory(category)
      }
    },
    reactiveField: {
      type: 'combobox',
      onChange: (value, ctx, setValue) => {
        setValue('otherField', ctx.values.someValue)
      }
    }
  }
}

// ✅ After
const myFormConfig = {
  fields: {
    conditional: {
      type: 'text',
      visibleWhen: ({ values }) => values.showField === true,
      rules: ({ values }) => (values.required ? z.string().min(1) : z.string().optional())
    },
    nestedField: {
      type: 'slider',
      min: ({ parent }) => (parent?.minValue as number) ?? 0,
      max: ({ parent }) => (parent?.maxValue as number) ?? 100
    },
    dynamicOptions: {
      type: 'select',
      options: ({ values }) => {
        const category = values.category as string
        return getOptionsForCategory(category)
      }
    },
    reactiveField: {
      type: 'combobox',
      onChange: ({ value, values, setValue }) => {
        setValue('otherField', values.someValue)
      }
    }
  }
}
```

## Conventional Commit

```
refactor: unify context pattern across all dynamic field functions

- Unify onChange signature to use single context parameter
- Replace (value, ctx, setValue) with ({ value, values, setValue })
- Update all FieldContext usages to use destructuring consistently
- Update field factories to use destructured parameters
- Update all form configurations with unified context syntax

BREAKING CHANGE: onChange signature changed from three parameters to unified context.
Use ({ value, values, setValue }) instead of (value, ctx, setValue).
```
