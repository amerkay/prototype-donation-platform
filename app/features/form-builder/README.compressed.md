1. TL;DR: type-safe form config -> `<FormRenderer :section="FormDef" v-model="modelValue" />`; validation/visibility/options/text dynamic via `FieldContext`; hidden fields excluded from validation

2. Setup: prereqs ?? ; install ?? ; config: define `FormDef` + `fields: FieldMetaMap`; validation via `z` (Zod) rules; optional defaults via `extractDefaultValues` from `~/features/form-builder/utils/defaults`

3. Core API/CLI:

- Vue comp: `FormRenderer`
  - props:
    - `section: FormDef` (req)
    - `modelValue: Record<string, unknown>` (v-model)
    - `context?: Record<string, unknown>` (default `{}`; merged into form logic)
    - `contextSchema?: ContextSchema` (for condition-builder UI)
    - `class?: string`
    - `validateOnMount?: boolean` (default `false`)
    - `updateOnlyWhenValid?: boolean` (default `false`; gate `update:modelValue`)

  - events:
    - `update:modelValue` (any field change; may be gated by `updateOnlyWhenValid`)
    - `submit` (only when submitted AND valid; invalid => no emit)

  - exposed:
    - `isValid` (computed ref)
    - `onSubmit()` (manual submit trigger)

- Types:
  - `interface FormDef { id: string; title?: string; description?: string; fields: FieldMetaMap; schema?: z.ZodTypeAny; defaultValue?: Record<string, unknown> }`
  - `type FieldMetaMap = Record<string, FieldMeta>`

- Common `FieldMeta` props (all fields):
  - `label?: string | (ctx: FieldContext)=>string`
  - `description?: string | (ctx: FieldContext)=>string`
  - `placeholder?: string | (ctx: FieldContext)=>string`
  - `defaultValue?: unknown`
  - `optional?: boolean` (shows "(optional)" badge)
  - `disabled?: boolean | (ctx: FieldContext)=>boolean`
  - `visibleWhen?: ((ctx: FieldContext)=>boolean) | ConditionGroup`
  - `rules?: z.ZodTypeAny | (ctx: FieldContext)=>z.ZodTypeAny`
  - `onChange?: (ctx: OnChangeContext)=>void`
  - `isSeparatorAfter?: boolean` (default no separators)
  - `class?: string` (input)
  - `labelClass?: string`
  - `descriptionClass?: string`
  - `autocomplete?: string`

- `interface FieldContext { values: Record<string, unknown>; parent?: Record<string, unknown>; root: Record<string, unknown>; form?: Record<string, unknown> }`
  - `values` = form values + external `context` merged at root
  - `form` = pure form values (no context), for submission (also in `onChange`)

- Declarative visibility:
  - `interface ConditionGroup { conditions: Condition[]; match: 'all'|'any'|'none' }`
  - `interface Condition { field: string; operator: ComparisonOperator; value?: unknown; valueFromField?: string }`
  - operators: `contains, notContains, greaterOrEqual, lessOrEqual, empty, notEmpty, isTrue, isFalse, in, notIn`

- `type SetFieldValueFn = (relativePath: string, value: unknown)=>void`
- `OnChangeContext` props:
  - `value, values, setValue(path,value), setFieldError(field,message), setFieldTouched(field,touched), path, parent, root, form`
  - path resolution: relative within container; siblings `setValue('email', ...)`; nested dot `setValue('address.city', ...)`

Field types (key props beyond common):

- `text`: `placeholder, autocomplete, maxLength`
- `textarea`: `rows, maxLength`
- `number`: `min, max, step` ; Enter submits form
- `toggle`: boolean; `rules` only if require true; can be `optional`
- `checkbox`:
  - without `options` => single boolean checkbox
  - with `options` (req for multi) => array value; `options: Array<{value,label}>`

- `select`: `options: Array<{ value: string, label: string }>`
- `combobox`: `options` (array or function), `multiple`, `searchPlaceholder`; dynamic options: `options: (ctx)=>computedOptions`
- `autocomplete`:
  - `fetchOptions: (query: string)=>Promise<AutocompleteOption[]>`
  - `options` (static fallback), `debounceMs`, `minQueryLength`
  - `AutocompleteOption { value: string|number, label: string, data?: any }` (`data` accessible in `onChange` via `value?.data`)

- `radio-group`: `options`, `orientation: 'horizontal'|'vertical'`
- `currency`: `currencySymbol` (string or (values)=>string), `min,max,step`
- `slider`:
  - `min,max,step` (number or `(ctx: FieldContext)=>value`)
  - `formatValue(value, formValues?)`, `showMinMax`, `minMaxFormatter(value, formValues)`, `prefix`, `suffix` (also dynamic funcs allowed)

- `emoji`: `maxLength` (# emojis; default `1`); placeholder
- `condition-builder`: admin meta-field -> produces `ConditionGroup`; prop `formFields` (available fields list)
- `card` (display-only): `label, description, content` (raw HTML), `imageSrc, imageAlt, imageClass`; supports slots via custom `FormField` template (API ??)
- Container fields:
  - `field-group`: `fields`, nests values under group key; layout via `class`; collapsible: `collapsible, collapsibleDefaultOpen, badgeLabel, badgeVariant`
  - `tabs`: `tabs: TabDefinition[]`, `defaultValue`, `tabsListClass`; per-tab `badgeLabel, badgeVariant`; values nested under tab `value`
  - `array`: repeating items; `itemField` (field def), `addButtonText`, `removeButtonText`, `sortable` (drag-drop opt-in), `class` (grid container)

- Validation:
  - per-field `rules` primary
  - root `FormDef.schema` only for cross-field; runs after all field-level validations pass
  - hidden (`visibleWhen` false) fields excluded from validation

4. Flow:

1) Define `FormDef { id, fields, (schema?), (defaultValue?) }`
2) (Optional) derive initial model: `extractDefaultValues(form.fields)` or use `FormDef.defaultValue`
3) Render: `<FormRenderer :section="form" v-model="data" :context="..." :context-schema="..." />`
4) Use `visibleWhen` (fn or `ConditionGroup`) + dynamic `rules/label/description/placeholder/options/min/max/...` via `FieldContext`
5) Handle submit via `@submit`; manual: `ref` -> check `isValid` -> `onSubmit()`

5. Gotchas:

- `visibleWhen` false => field skipped from validation (won’t block submit)
- `context` merged into `ctx.values` at root; NOT included in emitted `modelValue` / submission data
- dot notation for nested paths: `setValue('address.zip', ...)`; tab fields nested under tab `value`
- `checkbox` mode depends on `options`: none=>boolean; with=>array
- `array.sortable` default false; set `sortable: true` for drag handles
- collapsible `field-group` + `tabs` auto error badges when descendant fields invalid (badge shows `X errors` for collapsible groups)
- Enter submits for `text, textarea, number, currency`; textarea: `Shift+Enter` newline
- `updateOnlyWhenValid: true` stops invalid state from emitting `update:modelValue`
- declarative conditions serializable (DB/API); function conditions not serializable
- `card.content` is raw HTML (sanitization ??)

6. Examples:

```ts
import { extractDefaultValues } from '~/features/form-builder/utils/defaults'
const data = ref(extractDefaultValues(form.fields))
```

```vue
<FormRenderer
  :section="form"
  v-model="data"
  :context="{ donationTotal: 100 }"
  @submit="handleSubmit"
/>
```
