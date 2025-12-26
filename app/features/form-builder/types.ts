import type { z } from 'zod'

// ============================================================================
// CORE TYPES - Shared across all form builder features
// ============================================================================

/**
 * Field types supported by the form builder
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'toggle'
  | 'select'
  | 'combobox'
  | 'autocomplete'
  | 'radio-group'
  | 'array'
  | 'emoji'
  | 'slider'
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
  type: FieldType
  label?: string | ((values: Record<string, unknown>) => string)
  description?: string | ((values: Record<string, unknown>) => string)
  placeholder?: string | ((values: Record<string, unknown>) => string)
  optional?: boolean
  disabled?: boolean
  visibleWhen?: (values: Record<string, unknown>) => boolean
  isNoSeparatorAfter?: boolean
  class?: string
  labelClass?: string
  descriptionClass?: string
  autocomplete?: string // HTML autocomplete attribute
  rules?: z.ZodTypeAny | ((values: Record<string, unknown>) => z.ZodTypeAny)
  /**
   * Callback triggered when field value changes
   *
   * @param value - The new field value
   * @param allValues - Current form values (scoped to field-group if nested)
   * @param setValue - Function to set sibling/child field values using relative paths
   *
   * @example
   * ```typescript
   * onChange: (value, allValues, setValue) => {
   *   // Set sibling field
   *   setValue('siblingField', 'newValue')
   *
   *   // Set nested field
   *   setValue('nested.field', 123)
   * }
   * ```
   */
  onChange?: (value: unknown, allValues: Record<string, unknown>, setValue: SetFieldValueFn) => void
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
  currencySymbol: string | ((values: Record<string, unknown>) => string)
}

// --- Selection Fields ---

/**
 * Toggle/Switch field metadata
 */
export interface ToggleFieldMeta extends BaseFieldMeta {
  type: 'toggle'
}

/**
 * Select field metadata - native HTML select dropdown
 */
export interface SelectFieldMeta extends BaseFieldMeta {
  type: 'select'
  options:
    | Array<{ value: string | number; label: string }>
    | ((values: Record<string, unknown>) => Array<{ value: string | number; label: string }>)
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
    | ((values: Record<string, unknown>) => Array<{
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
  min?: number | ((values: Record<string, unknown>) => number)
  max?: number | ((values: Record<string, unknown>) => number)
  step?: number | ((values: Record<string, unknown>) => number)
  formatValue?: (value: number, formValues?: Record<string, unknown>) => string
  minMaxFormatter?: (value: number, formValues?: Record<string, unknown>) => string
  showMinMax?: boolean
  prefix?: string
  suffix?: string
}

// --- Container & Layout Fields ---

/**
 * Array field metadata
 */
export interface ArrayFieldMeta extends BaseFieldMeta {
  type: 'array'
  itemField: FieldMeta
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
  collapsibleDefaultOpen?: boolean
  badgeLabel?: string
  badgeVariant?: 'default' | 'outline' | 'secondary' | 'destructive'
  isDisabled?: boolean
  rules?: z.ZodTypeAny | ((values: Record<string, unknown>) => z.ZodTypeAny)
}

/**
 * Tab definition for tabs field
 */
export interface TabDefinition {
  value: string
  label: string | ((values: Record<string, unknown>) => string)
  fields: FieldMetaMap
  badgeLabel?: string | ((values: Record<string, unknown>) => string)
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
  rules?: z.ZodTypeAny | ((values: Record<string, unknown>) => z.ZodTypeAny)
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

// ============================================================================
// UNION TYPES - Aggregates for type-safe field handling
// ============================================================================

export type FieldMeta =
  | TextFieldMeta
  | TextareaFieldMeta
  | NumberFieldMeta
  | CurrencyFieldMeta
  | ToggleFieldMeta
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

/**
 * Map of field paths to their metadata
 */
export type FieldMetaMap = Record<string, FieldMeta>
