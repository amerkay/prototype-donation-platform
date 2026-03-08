---
paths:
  - 'app/features/_library/**'
---

# Library Modules (form-builder + custom-fields)

**SACRED RULE**: No imports from outside `_library/` (except `@/components/ui/` and `@/lib/utils`). Keep abstractions generic — use "field", "form", "value", never "donation", "campaign", "donor".

## To add a new form field type

1. Read `form-builder/README.md` first
2. Add a field constructor in `api/defineForm.ts`, export from `api/index.ts`. 24 field types exist (text, textarea, number, currency, hidden, toggle, checkbox, select, combobox, autocomplete, radioGroup, date, emoji, color, richText, slider, imageUpload, array, fieldGroup, tabs, card, alert, sectionHeading, readonly, component)
3. All fields must support: `label`, `helpText`, `rules`, `visibleWhen`, `disabled`, `onChange`, `onVisibilityChange`
4. Entry point for form definitions: `defineForm()` in `api/defineForm.ts`
5. For help text UI: use `FieldHelpText` component (`internal/FieldHelpText.vue`) — supports `#trigger` slot
6. Containers in `containers/`: `FormFieldArray` (repeating), `FormFieldGroup` (collapsible), `FormFieldTabs`
7. Store auto-mapping: use `$storePath` metadata + `useAdminConfigForm()`. `$storePath: 'flatten'` recurses through tabs/groups for identity mappings
8. Auto-sidebar: `useFormSidebar` + `FormSidebarNav` (internal). Search: `useFormSearch` + `FormSearchInput`
9. No Pinia stores — state is managed via vee-validate + Vue Composition API

## To add a new custom field type

1. Read `custom-fields/README.md` first
2. Create a factory that exports three functions:
   - `createAdminConfig()` — admin UI form definition
   - `toComposable(config)` — converts admin config to runtime field
   - `getDefaultValue(config)` — extracts default value
3. Existing types for reference: text, textarea, number, slider, select, radio-group, checkbox, hidden

## To work with conditions and filters

- Declarative visibility: `conditions/` — `ConditionGroup` for serializable visibility rules
- Condition builder UI: `conditions/ui/` — shared builders for custom-fields and filter UIs
- Filter system: `filters/` — `useFilterState(id, schema, options?)` for condition-builder-based admin filters with URL sync

## Tests

Located at `test/nuxt/features/form-builder/` and `test/nuxt/features/custom-fields/`.
