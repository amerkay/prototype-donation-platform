---
paths:
  - 'app/features/_library/**'
---

# Library Modules (form-builder + custom-fields)

## form-builder

Schema-driven form framework using Composition API + vee-validate + Zod.

- Entry point: `defineForm()` in `api/defineForm.ts`
- Field constructors: `textField()`, `numberField()`, `selectField()`, `comboboxField()`, `arrayField()`, etc.
- All fields support: `label`, `helpText`, `rules`, `visibleWhen`, `disabled`, `onChange`, `onVisibilityChange`
- `FieldHelpText` component (`internal/FieldHelpText.vue`) — reusable info icon + popover, supports `#trigger` slot
- Condition system in `conditions/` — declarative `ConditionGroup` for serializable visibility rules
- Condition builder UI in `conditions/ui/` — shared builders for custom-fields and filter UIs
- Filter system in `filters/` — `useFilterState(id, schema, options?)` for condition-builder-based admin filters with URL sync
- Containers: `FormFieldArray` (repeating), `FormFieldGroup` (collapsible), `FormFieldTabs`
- Store auto-mapping via `$storePath` metadata + `useAdminConfigForm()`
- No Pinia stores — state managed via vee-validate + Vue Composition API

## custom-fields

Admin-configurable dynamic fields. Each field type exports a factory:

- `createAdminConfig()` — admin UI form definition
- `toComposable(config)` — converts admin config to runtime field
- `getDefaultValue(config)` — extracts default value

8 field type factories: text, textarea, number, slider, select, radio-group, checkbox, hidden.

## Rules

- Keep abstractions generic — use "field", "form", "value", never "donation", "campaign", "donor"
- No imports from outside `_library/` (except `@/components/ui/` and `@/lib/utils`)
- Tests: `test/nuxt/features/form-builder/` and `test/nuxt/features/custom-fields/`
