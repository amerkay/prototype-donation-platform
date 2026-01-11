1. TL;DR: UI-configurable dynamic form fields (admin config -> runtime render) w/ defaults, validation, conditional visibility; no code per field (except adding new field types).

2. Setup: TS/Vue; config path `customFields:{enabled:boolean,fields:CustomFieldDefinition[]}`; runtime: `createCustomFieldsFormSection(config.customFields.fields)` + `<FormRenderer :section="section" v-model="donorData" />`; admin: `createCustomFieldsConfigSection(contextSchema?, resolveExternalFields?, allowedFieldTypes?)`.

3. Core API/CLI:

- `createCustomFieldsConfigSection(contextSchema?, resolveExternalFields?, allowedFieldTypes?) -> FormDef`
  - `contextSchema`: `{[key:string]:{label:string,type:'number'|'string'|'boolean'??,options?:any[]??}}`
  - `resolveExternalFields(rootValues)-> {key,label,type,group?}[]` (dynamic condition fields)
  - `allowedFieldTypes`: restrict selectable types (shape ??)

- `createCustomFieldsFormSection(fields:CustomFieldDefinition[]) -> FormDef`
- `extractCustomFieldDefaults(fields:CustomFieldDefinition[]) -> Record<string,unknown>`
- utils: `slugify(text, maxLength?) -> string`; `extractFieldValue(config,key,default?) -> any`; `validateCustomFieldConditions() -> void/??` (post-reorder ref validation)

Types:

- `CustomFieldsSettings = {enabled:boolean, fields:CustomFieldDefinition[]}`
- `CustomFieldType = 'text'|'textarea'|'number'|'slider'|'select'|'radio-group'|'checkbox'|'hidden'|...`
- `CustomFieldDefinition` = discriminated union `{type:<lit>} & <TypeConfig>`

Field configs (all: `id:string,label:string,optional?:boolean (default:true)`):

- `text`: `placeholder? maxLength?`; note: auto-trims whitespace
- `textarea`: `placeholder? rows? (default:4) maxLength?`
- `number`: `min? max? step?`; note: Enter key submits form
- `slider`: `min* max* step? prefix? suffix? showMinMax?` (\*required: min,max)
- `select`: `options[]* placeholder?`; option values auto-slugified from labels
- `radio-group`: `options[]* orientation?`; values auto-slugified
- `checkbox`: `options[]?` (no options => boolean mode)
- `hidden`: `defaultValue*`; always excluded from validation; can force hidden via `visibleWhen:()=>false` (runtime meta)

Visibility conditions (per-field):

- toggle required: `enableVisibilityConditions:true`
- `visibilityConditions:{ visibleWhen:{ match:'all'|'any'|'none', conditions:[{field,operator,value?}...] } }`
- operators: `equals notEquals contains notContains startsWith endsWith greaterThan lessThan greaterThanOrEqual lessThanOrEqual in notIn empty notEmpty`
- refs: can reference (a) preceding custom fields only, (b) `contextSchema` fields, (c) dynamic fields from `resolveExternalFields`

Validation:

- required: `optional:false` => must have value (except `hidden`)
- type constraints: number min/max; string maxLength
- conditional/hidden: invisible fields skip validation automatically; `hidden` always excluded
- implementation: Zod schemas per factory (exact schemas ??)

4. Flow:

1) Admin UI: `createCustomFieldsConfigSection(contextSchema?, resolveExternalFields?, allowedFieldTypes?)` -> admin form saves `customFields.fields[]`
2) Runtime: `createCustomFieldsFormSection(fields)` -> `section` -> `FormRenderer` binds model
3) (opt) defaults: `extractCustomFieldDefaults(fields)` -> init model

5. Gotchas:

- `optional` default `true` (so set `optional:false` for required)
- visibility: must set `enableVisibilityConditions:true` or `visibilityConditions` ignored ??
- condition refs: only preceding custom fields valid; reordering can break -> use `validateCustomFieldConditions()`
- `select`/`radio-group` option `value` auto `slugify(label)` (expect `united_states` etc); changing labels changes values
- `checkbox` dual-mode: `options[]` => multi-select; none => boolean
- `hidden` excluded from validation always; use for tracking defaults; can hide via `visibleWhen:()=>false`
- slider requires `min,max` (missing => invalid config)

6. Examples:

- Admin form:
  - `createCustomFieldsConfigSection(contextSchema, resolveExternalFields, allowedFieldTypes)`

- Runtime:
  - `const section=createCustomFieldsFormSection(config.customFields.fields); <FormRenderer :section="section" v-model="donorData" />`

- Visibility snippet:
  - `{...,enableVisibilityConditions:true,visibilityConditions:{visibleWhen:{match:'all',conditions:[{field:'reason',operator:'equals',value:'other'}]}}}`
