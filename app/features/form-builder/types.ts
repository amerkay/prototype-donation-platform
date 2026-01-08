import type { z } from 'zod'
import type { ConditionGroup } from './conditions'

// ============================================================================
// CORE TYPES - Shared across all form builder features
// ============================================================================

/**
 * Context object passed to dynamic field functions
 * Provides access to form values at different scopes
 */
export interface FieldContext {
  /** Current field or group's values (includes external context) */
  values: Record<string, unknown>
  /** Parent container's values (for nested fields in field-groups) */
  parent?: Record<string, unknown>
  /** Root form values (all fields, includes external context) */
  root: Record<string, unknown>
  /** Pure form values without external context (for submission) */
  form?: Record<string, unknown>
}

/**
 * Context object passed to onChange callbacks
 * Extends FieldContext with guaranteed value and setValue
 */
export interface OnChangeContext extends FieldContext {
  /** Current field's new value */
  value: unknown
  /** Function to set field values using relative paths */
  setValue: SetFieldValueFn
  /** Full path to the current field */
  path?: string
  /** Function to set a field's error message */
  setFieldError?: (field: string, message: string | string[] | undefined) => void
  /** Function to set a field's touched state */
  setFieldTouched?: (field: string, isTouched?: boolean) => void
}

/**
 * Field types supported by the form builder
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'toggle'
  | 'checkbox'
  | 'select'
  | 'combobox'
  | 'autocomplete'
  | 'radio-group'
  | 'array'
  | 'emoji'
  | 'slider'
  | 'condition-builder'
  | 'field-group'
  | 'card'
  | 'separator'
  | 'tabs'

/**
 * Config section definition
 */
export interface FormDef<T extends z.ZodTypeAny = z.ZodTypeAny> {
  id: string
  title?: string
  description?: string
  schema?: T
  fields: FieldMetaMap
  defaultValue?: z.infer<T>
}

/**
 * Function type for setting field values with relative paths
 * Used in onChange callbacks and field components
 *
 * @param relativePath - Dot-notation path relative to current context (e.g., 'country' or 'address.city')
 * @param value - Value to set (type safety enforced by Zod schemas at runtime)
 *
 * @example
 * ```typescript
 * const setValue: SetFieldValueFn = (path, value) => {
 *   setValue('address1', '123 Main St')
 *   setValue('countyPostcode.county', 'London')
 * }
 * ```
 */
export type SetFieldValueFn = (relativePath: string, value: unknown) => void

/**
 * Base field metadata - extended by all field-specific metadata interfaces
 */
export interface BaseFieldMeta {
  type: FieldType | ((ctx: FieldContext) => FieldType)
  label?: string | ((ctx: FieldContext) => string)
  description?: string | ((ctx: FieldContext) => string)
  placeholder?: string | ((ctx: FieldContext) => string)
  defaultValue?: unknown
  optional?: boolean
  disabled?: boolean | ((ctx: FieldContext) => boolean)
  visibleWhen?: ((ctx: FieldContext) => boolean) | ConditionGroup
  isSeparatorAfter?: boolean
  class?: string
  labelClass?: string
  descriptionClass?: string
  autocomplete?: string // HTML autocomplete attribute
  rules?: z.ZodTypeAny | ((ctx: FieldContext) => z.ZodTypeAny)
  /**
   * Callback triggered when field value changes
   *
   * @param ctx - Unified field context with guaranteed value and setValue
   * @returns Optional FieldMeta to apply defaults from (useful for dynamic field configs)
   *
   * @example
   * ```typescript
   * // Set other fields based on current value
   * onChange: ({ value, values, setValue }) => {
   *   setValue('siblingField', 'newValue')
   *   // Access parent: destructure parent property
   *   // Access root: destructure root property
   * }
   *
   * // Return metadata approach - framework auto-applies defaults
   * onChange: ({ value }) => {
   *   return FIELD_FACTORIES[value].createAdminConfig()
   * }
   * ```
   */
  onChange?: (ctx: OnChangeContext) => unknown
}

// ============================================================================
// FIELD COMPONENT PROPS & EMITS - Shared by value-based field components
// ============================================================================

/**
 * Standard props for all value-based form field components
 * Used by: Text, Textarea, Number, Currency, Toggle, Select, Combobox, Autocomplete, RadioGroup, Emoji, Slider
 */
export interface FieldProps<TValue = unknown, TMeta = unknown> {
  modelValue?: TValue
  errors: string[]
  meta: TMeta
  name: string
  id?: string
  onBlur?: (e?: Event) => void
  class?: string
}

/**
 * Standard emits for all form field components with v-model support
 */
export interface FieldEmits<TValue = unknown> {
  'update:modelValue': [value: TValue]
}

// ============================================================================
// FIELD METADATA INTERFACES - Specific to each field type
// ============================================================================

// --- Input Fields ---

/**
 * Text field metadata
 */
export interface TextFieldMeta extends BaseFieldMeta {
  type: 'text'
  maxLength?: number
}

/**
 * Textarea field metadata
 */
export interface TextareaFieldMeta extends BaseFieldMeta {
  type: 'textarea'
  rows?: number
  maxLength?: number
}

/**
 * Number field metadata
 */
export interface NumberFieldMeta extends BaseFieldMeta {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

/**
 * Currency field metadata - number input with currency symbol prefix
 */
export interface CurrencyFieldMeta extends BaseFieldMeta {
  type: 'currency'
  min?: number
  max?: number
  step?: number
  currencySymbol: string | ((ctx: FieldContext) => string)
}

/**
 * Toggle/Switch field metadata
 */
export interface ToggleFieldMeta extends BaseFieldMeta {
  type: 'toggle'
}

/**
 * Checkbox field metadata
 * Supports both single checkbox (boolean) and checkbox array (string[])
 */
export interface CheckboxFieldMeta extends BaseFieldMeta {
  type: 'checkbox'
  /**
   * For checkbox arrays: list of options
   * For single checkbox: omit this property
   */
  options?: ReadonlyArray<{ value: string; label: string }>
}

// --- Selection Fields ---

/**
 * Select field metadata - native HTML select dropdown
 */
export interface SelectFieldMeta extends BaseFieldMeta {
  type: 'select'
  options:
    | Array<{ value: string | number; label: string }>
    | ((ctx: FieldContext) => Array<{ value: string | number; label: string }>)
  searchPlaceholder?: string // Not used in native select, kept for API compatibility
  notFoundText?: string // Not used in native select, kept for API compatibility
}

/**
 * Combobox field metadata - searchable select with single or multiple selection
 */
export interface ComboboxFieldMeta extends BaseFieldMeta {
  type: 'combobox'
  options:
    | Array<{
        value: string | number
        label: string
        description?: string
        disabled?: boolean
      }>
    | ((ctx: FieldContext) => Array<{
        value: string | number
        label: string
        description?: string
        disabled?: boolean
      }>)
  multiple?: boolean // Enable multi-select mode
  searchPlaceholder?: string
  notFoundText?: string
}

/**
 * Autocomplete option type - can include arbitrary data
 */
export interface AutocompleteOption {
  value: string | number
  label: string
  description?: string
  data?: unknown // For passing parsed objects (e.g., LocationIQAddress)
}

/**
 * Autocomplete field metadata - async typeahead with optional static fallback
 */
export interface AutocompleteFieldMeta extends BaseFieldMeta {
  type: 'autocomplete'
  options?: ReadonlyArray<AutocompleteOption> // Static options (fallback)
  fetchOptions?: (
    query: string,
    formValues: Record<string, unknown>
  ) => Promise<AutocompleteOption[]>
  minQueryLength?: number // Minimum chars before fetching (default 3)
  debounceMs?: number // Debounce delay in ms (default 300)
  searchPlaceholder?: string
  notFoundText?: string
}

/**
 * Radio group field metadata
 */
export interface RadioGroupFieldMeta extends BaseFieldMeta {
  type: 'radio-group'
  options: ReadonlyArray<{ value: string | number; label: string; description?: string }>
  orientation?: 'vertical' | 'horizontal'
}

// --- Specialized Input Fields ---

/**
 * Emoji field metadata - single emoji input
 */
export interface EmojiFieldMeta extends BaseFieldMeta {
  type: 'emoji'
  maxLength?: number
}

/**
 * Slider field metadata - range input slider
 */
export interface SliderFieldMeta extends BaseFieldMeta {
  type: 'slider'
  min?: number | ((ctx: FieldContext) => number)
  max?: number | ((ctx: FieldContext) => number)
  step?: number | ((ctx: FieldContext) => number)
  formatValue?: (value: number, ctx?: FieldContext) => string
  minMaxFormatter?: (value: number, ctx?: FieldContext) => string
  showMinMax?: boolean
  prefix?: string | ((ctx: FieldContext) => string | undefined)
  suffix?: string | ((ctx: FieldContext) => string | undefined)
}

// --- Container & Layout Fields ---

/**
 * Array context provided to itemField function
 */
export interface ArrayItemContext {
  /** Current item index in the array */
  index: number
  /** All items in the array */
  items: Record<string, unknown>[]
  /** Root form values (all fields, includes external context) */
  root: Record<string, unknown>
}

/**
 * Array field metadata
 */
export interface ArrayFieldMeta extends BaseFieldMeta {
  type: 'array'
  itemField: FieldMeta | ((values: Record<string, unknown>, context: ArrayItemContext) => FieldMeta)
  addButtonText?: string
  removeButtonText?: string
  sortable?: boolean // Enable drag-and-drop reordering (default: false)
}

/**
 * Field group metadata - horizontal grouping of fields
 */
export interface FieldGroupMeta extends BaseFieldMeta {
  type: 'field-group'
  fields?: FieldMetaMap
  legend?: string
  collapsible?: boolean
  collapsibleDefaultOpen?: boolean | ((ctx: FieldContext) => boolean)
  badgeLabel?: string
  badgeVariant?: 'default' | 'outline' | 'secondary' | 'destructive'
  isDisabled?: boolean
  /**
   * Control whether default values should be extracted from this group's children
   * Set to `false` to skip default extraction (useful for conditional type-specific configs)
   * @default true
   */
  extractDefaultsWhen?: boolean
}

/**
 * Tab definition for tabs field
 */
export interface TabDefinition {
  value: string
  label: string | ((ctx: FieldContext) => string)
  fields: FieldMetaMap
  badgeLabel?: string | ((ctx: FieldContext) => string)
  badgeVariant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

/**
 * Tabs field metadata - tabbed interface for organizing related fields
 */
export interface TabsFieldMeta extends BaseFieldMeta {
  type: 'tabs'
  tabs: TabDefinition[]
  defaultValue?: string // Default active tab value
  tabsListClass?: string
}

// --- Display-Only Fields ---

/**
 * Card field metadata - informational display card
 */
export interface CardFieldMeta extends BaseFieldMeta {
  type: 'card'
  imageSrc?: string // Optional image to display in card
  imageAlt?: string // Alt text for image
  imageClass?: string // Custom classes for image element
  content?: string // Rich HTML content (use with caution)
}

/**
 * Separator field metadata - visual divider
 */
export interface SeparatorFieldMeta extends BaseFieldMeta {
  type: 'separator'
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Condition builder field metadata - UI for building ConditionGroup objects
 */
export interface ConditionBuilderFieldMeta extends BaseFieldMeta {
  type: 'condition-builder'
  formFields?: FieldMetaMap // Form fields available for condition selection
}

// ============================================================================
// UNION TYPES - Aggregates for type-safe field handling
// ============================================================================

export type FieldMeta =
  | TextFieldMeta
  | TextareaFieldMeta
  | NumberFieldMeta
  | CurrencyFieldMeta
  | ToggleFieldMeta
  | CheckboxFieldMeta
  | SelectFieldMeta
  | ComboboxFieldMeta
  | AutocompleteFieldMeta
  | RadioGroupFieldMeta
  | ArrayFieldMeta
  | EmojiFieldMeta
  | SliderFieldMeta
  | CardFieldMeta
  | SeparatorFieldMeta
  | FieldGroupMeta
  | TabsFieldMeta
  | ConditionBuilderFieldMeta

/**
 * Map of field paths to their metadata
 */
export type FieldMetaMap = Record<string, FieldMeta>
