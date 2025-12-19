import type { z } from 'zod'

/**
 * Field types supported by the form builder
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
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
 * Base field metadata
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

/**
 * Text field metadata
 */
export interface TextFieldMeta extends BaseFieldMeta {
  type: 'text'
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
  options: ReadonlyArray<{ value: string | number; label: string }>
  searchPlaceholder?: string // Not used in native select, kept for API compatibility
  notFoundText?: string // Not used in native select, kept for API compatibility
}

/**
 * Combobox field metadata - searchable select with single or multiple selection
 */
export interface ComboboxFieldMeta extends BaseFieldMeta {
  type: 'combobox'
  options:
    | ReadonlyArray<{
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

/**
 * Array field metadata
 */
export interface ArrayFieldMeta extends BaseFieldMeta {
  type: 'array'
  itemField: FieldMeta
  addButtonText?: string
  removeButtonText?: string
}

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
  min?: number
  max?: number
  step?: number
  formatValue?: (value: number, allValues: Record<string, unknown>) => string
  showMinMax?: boolean
  minMaxFormatter?: (value: number) => string
}

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
 * Union of all field metadata types
 */
export type FieldMeta =
  | TextFieldMeta
  | TextareaFieldMeta
  | NumberFieldMeta
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

/**
 * Map of field paths to their metadata
 */
export type FieldMetaMap = Record<string, FieldMeta>

/**
 * Config section definition
 */
export interface ConfigSectionDef<T extends z.ZodTypeAny = z.ZodTypeAny> {
  id: string
  title?: string
  description?: string
  schema?: T
  fields: FieldMetaMap
  defaultValue?: z.infer<T>
}

/**
 * Common field props interface for vee-validate field components
 */
export interface VeeFieldContext {
  value?: unknown
  onChange: (value: unknown) => void
  onBlur?: (e: Event) => void
  name: string
}
