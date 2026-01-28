import type { ComputedRef } from 'vue'
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
 * Context object passed to onVisibilityChange callbacks
 * Provides access to form values and current visibility state
 */
export interface OnVisibilityChangeContext extends FieldContext {
  /** Whether the field is now visible */
  visible: boolean
  /** Current field's value */
  value: unknown
  /** Function to set field values using relative paths */
  setValue: SetFieldValueFn
  /** Function to clear field value without triggering validation */
  clearValue: (relativePath: string) => void
  /** Full path to the current field */
  path?: string
}

/**
 * Field types supported by the form builder
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'hidden'
  | 'toggle'
  | 'checkbox'
  | 'select'
  | 'combobox'
  | 'autocomplete'
  | 'radio-group'
  | 'array'
  | 'emoji'
  | 'slider'
  | 'image-upload'
  | 'condition-builder'
  | 'field-group'
  | 'card'
  | 'tabs'
  | 'component'

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

// ============================================================================
// COMPOSITION API TYPES
// ============================================================================

/**
 * Form context provided to defineForm setup function
 * Gives access to reactive form values for dynamic field configuration
 */
export interface FormContext {
  /** Reactive form values (includes external context) */
  values: ComputedRef<Record<string, unknown>>
  /** Pure form values without external context */
  form: ComputedRef<Record<string, unknown>>
  /** Optional title (can be set in setup) */
  title?: string
  /** Optional description (can be set in setup) */
  description?: string
}

/**
 * Composable form definition returned by defineForm
 */
export interface ComposableForm<T extends z.ZodTypeAny = z.ZodTypeAny> {
  /** Unique form identifier */
  id: string
  /** Optional form-level validation schema */
  schema?: T
  /** Setup function that returns field definitions */
  setup: (ctx: FormContext) => Record<string, FieldDef>
  /** Metadata extracted at definition time */
  _meta?: {
    title?: string
    description?: string
  }
}

/**
 * Visibility function type for cleaner signatures
 */
export type VisibilityFn = ((ctx: FieldContext) => boolean) | ComputedRef<boolean>

/**
 * Base configuration for all fields (omits type and name - handled by constructors)
 */
export interface BaseFieldConfig {
  label?: string | ComputedRef<string> | ((ctx: FieldContext) => string)
  description?: string | ComputedRef<string> | ((ctx: FieldContext) => string)
  placeholder?: string | ComputedRef<string> | ((ctx: FieldContext) => string)
  defaultValue?: unknown
  optional?: boolean
  disabled?: boolean | ComputedRef<boolean> | ((ctx: FieldContext) => boolean)
  visibleWhen?: VisibilityFn | ConditionGroup
  showSeparatorAfter?: boolean
  class?: string | ComputedRef<string> | ((ctx: FieldContext) => string)
  labelClass?: string
  descriptionClass?: string
  autocomplete?: string
  rules?: z.ZodTypeAny | ComputedRef<z.ZodTypeAny> | ((ctx: FieldContext) => z.ZodTypeAny)
  onChange?: (ctx: OnChangeContext) => unknown
  onVisibilityChange?: (ctx: OnVisibilityChangeContext) => void
}

// ============================================================================
// SHARED TYPES - Used by field definitions and components
// ============================================================================

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
 * Autocomplete option type - can include arbitrary data
 */
export interface AutocompleteOption {
  value: string | number
  label: string
  description?: string
  data?: unknown // For passing parsed objects (e.g., LocationIQAddress)
}

// ============================================================================
// FIELD-SPECIFIC CONFIG TYPES
// ============================================================================

export interface TextFieldConfig extends BaseFieldConfig {
  maxLength?: number
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  rows?: number
  maxLength?: number
  isShowMaxLengthIndicator?: boolean
}

export interface NumberFieldConfig extends BaseFieldConfig {
  min?: number
  max?: number
  step?: number
}

export interface CurrencyFieldConfig extends BaseFieldConfig {
  min?: number
  max?: number
  step?: number
  currencySymbol: string | ComputedRef<string> | ((ctx: FieldContext) => string)
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ToggleFieldConfig extends BaseFieldConfig {}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  options?: ReadonlyArray<{ value: string; label: string }>
}

export interface SelectFieldConfig extends BaseFieldConfig {
  options:
    | Array<{ value: string | number; label: string }>
    | ComputedRef<Array<{ value: string | number; label: string }>>
    | ((ctx: FieldContext) => Array<{ value: string | number; label: string }>)
  searchPlaceholder?: string
  notFoundText?: string
}

export interface ComboboxFieldConfig extends BaseFieldConfig {
  options:
    | Array<{
        value: string | number
        label: string
        description?: string
        disabled?: boolean
      }>
    | ComputedRef<
        Array<{
          value: string | number
          label: string
          description?: string
          disabled?: boolean
        }>
      >
    | ((ctx: FieldContext) => Array<{
        value: string | number
        label: string
        description?: string
        disabled?: boolean
      }>)
  multiple?: boolean
  searchPlaceholder?: string
  notFoundText?: string
}

export interface AutocompleteFieldConfig extends BaseFieldConfig {
  options?: ReadonlyArray<AutocompleteOption>
  fetchOptions?: (
    query: string,
    formValues: Record<string, unknown>
  ) => Promise<AutocompleteOption[]>
  minQueryLength?: number
  debounceMs?: number
  searchPlaceholder?: string
  notFoundText?: string
}

export interface RadioGroupFieldConfig extends BaseFieldConfig {
  options: ReadonlyArray<{ value: string | number; label: string; description?: string }>
  orientation?: 'vertical' | 'horizontal'
}

export interface EmojiFieldConfig extends BaseFieldConfig {
  maxLength?: number
}

export interface SliderFieldConfig extends BaseFieldConfig {
  min?: number | ComputedRef<number> | ((ctx: FieldContext) => number)
  max?: number | ComputedRef<number> | ((ctx: FieldContext) => number)
  step?: number | ComputedRef<number> | ((ctx: FieldContext) => number)
  formatValue?: (value: number, ctx?: FieldContext) => string
  minMaxFormatter?: (value: number, ctx?: FieldContext) => string
  showMinMax?: boolean
  prefix?: string | ComputedRef<string | undefined> | ((ctx: FieldContext) => string | undefined)
  suffix?: string | ComputedRef<string | undefined> | ((ctx: FieldContext) => string | undefined)
}

export interface ImageUploadFieldConfig extends BaseFieldConfig {
  accept?: string
  maxSizeMB?: number
  recommendedDimensions?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HiddenFieldConfig extends BaseFieldConfig {
  // Hidden fields inherit all base config (label, defaultValue, visibleWhen, etc.)
  // No additional field-specific configuration needed
}

export interface ArrayFieldConfig extends BaseFieldConfig {
  itemField: FieldDef | ((values: Record<string, unknown>, context: ArrayItemContext) => FieldDef)
  addButtonText?: string
  removeButtonText?: string
  sortable?: boolean
}

export interface FieldGroupConfig extends BaseFieldConfig {
  fields: Record<string, FieldDef>
  legend?: string
  collapsible?: boolean
  collapsibleDefaultOpen?: boolean | ComputedRef<boolean> | ((ctx: FieldContext) => boolean)
  /** External ref to sync accordion state - enables reactive access from outside form */
  collapsibleStateRef?: Ref<string | undefined>
  badgeLabel?: string | ComputedRef<string>
  badgeVariant?: 'default' | 'outline' | 'secondary' | 'destructive'
  extractDefaultsWhen?: boolean
  /** CSS classes for the wrapper element (Accordion/FieldSet container) */
  wrapperClass?: string

  /**
   * Store mapping metadata for auto-mapping in admin config forms
   *
   * Controls how this field group maps to store properties:
   * - `string`: Map to specific store path (e.g., 'customPath' → store.customPath)
   * - `null`: Exclude from store mapping (component fields, computed values)
   * - `Record<string, string>`: Granular per-field mapping (e.g., { name: 'basicInfo.name' })
   * - `undefined` (default): Use convention (field name → store path)
   *
   * @example
   * ```ts
   * // Convention (default) - form.settings → store.settings
   * fieldGroup('settings', { fields: {...} })
   *
   * // Custom path - form.features.impactCart → store.impactCart
   * fieldGroup('features', {
   *   fields: { impactCart: {...} },
   *   $storePath: { impactCart: 'impactCart' }
   * })
   *
   * // Exclude from mapping - component field only
   * fieldGroup('preview', {
   *   fields: { component: componentField(...) },
   *   $storePath: null
   * })
   * ```
   */
  $storePath?: string | null | Record<string, string>
}

export interface TabDefinitionConfig {
  value: string
  label: string | ComputedRef<string> | ((ctx: FieldContext) => string)
  fields: Record<string, FieldDef>
  badgeLabel?: string | ComputedRef<string> | ((ctx: FieldContext) => string)
  badgeVariant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

export interface TabsFieldConfig extends BaseFieldConfig {
  tabs: TabDefinitionConfig[]
  defaultValue?: string
  tabsListClass?: string
}

export interface CardFieldConfig extends BaseFieldConfig {
  imageSrc?: string
  imageAlt?: string
  imageClass?: string
  content?: string
  showBorder?: boolean
}

export interface ComponentFieldConfig<TProps = Record<string, unknown>> extends BaseFieldConfig {
  /** Vue component to render */
  component: Component
  /** Props to pass to the component (static or dynamic) */
  props?: TProps | ((ctx: FieldContext) => TProps)
}

// ============================================================================
// FIELD DEFINITION TYPES (returned by field constructors)
// ============================================================================

/**
 * Generic field definition helper
 * Combines config with type discriminator and name
 */
export type Field<Type extends FieldType, Config> = Config & {
  readonly type: Type
  readonly name: string
}

/**
 * Registry mapping field type literals to their config types
 * Single source of truth for all field type ↔ config relationships
 */
export interface FieldRegistry {
  text: TextFieldConfig
  textarea: TextareaFieldConfig
  number: NumberFieldConfig
  currency: CurrencyFieldConfig
  hidden: HiddenFieldConfig
  toggle: ToggleFieldConfig
  checkbox: CheckboxFieldConfig
  select: SelectFieldConfig
  combobox: ComboboxFieldConfig
  autocomplete: AutocompleteFieldConfig
  'radio-group': RadioGroupFieldConfig
  emoji: EmojiFieldConfig
  slider: SliderFieldConfig
  'image-upload': ImageUploadFieldConfig
  array: ArrayFieldConfig
  'field-group': FieldGroupConfig
  tabs: TabsFieldConfig
  card: CardFieldConfig
  component: ComponentFieldConfig<Record<string, unknown>>
}

/**
 * Individual field definition types using generic helper
 */
export type TextFieldDef = Field<'text', TextFieldConfig>
export type TextareaFieldDef = Field<'textarea', TextareaFieldConfig>
export type NumberFieldDef = Field<'number', NumberFieldConfig>
export type CurrencyFieldDef = Field<'currency', CurrencyFieldConfig>
export type HiddenFieldDef = Field<'hidden', HiddenFieldConfig>
export type ToggleFieldDef = Field<'toggle', ToggleFieldConfig>
export type CheckboxFieldDef = Field<'checkbox', CheckboxFieldConfig>
export type SelectFieldDef = Field<'select', SelectFieldConfig>
export type ComboboxFieldDef = Field<'combobox', ComboboxFieldConfig>
export type AutocompleteFieldDef = Field<'autocomplete', AutocompleteFieldConfig>
export type RadioGroupFieldDef = Field<'radio-group', RadioGroupFieldConfig>
export type EmojiFieldDef = Field<'emoji', EmojiFieldConfig>
export type SliderFieldDef = Field<'slider', SliderFieldConfig>
export type ImageUploadFieldDef = Field<'image-upload', ImageUploadFieldConfig>
export type ArrayFieldDef = Field<'array', ArrayFieldConfig>
export type FieldGroupDef = Field<'field-group', FieldGroupConfig>
export type TabsFieldDef = Field<'tabs', TabsFieldConfig>
export type CardFieldDef = Field<'card', CardFieldConfig>
export type ComponentFieldDef<TProps = Record<string, unknown>> = Field<
  'component',
  ComponentFieldConfig<TProps>
>

/**
 * Union of all field definition types (auto-generated from registry)
 */
export type FieldDef = {
  [K in keyof FieldRegistry]: Field<K, FieldRegistry[K]>
}[keyof FieldRegistry]

// ============================================================================
// TYPE GUARDS - Runtime type checking with TypeScript narrowing
// ============================================================================

export const isTextField = (field: FieldDef): field is TextFieldDef => field.type === 'text'
export const isTextareaField = (field: FieldDef): field is TextareaFieldDef =>
  field.type === 'textarea'
export const isNumberField = (field: FieldDef): field is NumberFieldDef => field.type === 'number'
export const isCurrencyField = (field: FieldDef): field is CurrencyFieldDef =>
  field.type === 'currency'
export const isHiddenField = (field: FieldDef): field is HiddenFieldDef => field.type === 'hidden'
export const isToggleField = (field: FieldDef): field is ToggleFieldDef => field.type === 'toggle'
export const isCheckboxField = (field: FieldDef): field is CheckboxFieldDef =>
  field.type === 'checkbox'
export const isSelectField = (field: FieldDef): field is SelectFieldDef => field.type === 'select'
export const isComboboxField = (field: FieldDef): field is ComboboxFieldDef =>
  field.type === 'combobox'
export const isAutocompleteField = (field: FieldDef): field is AutocompleteFieldDef =>
  field.type === 'autocomplete'
export const isRadioGroupField = (field: FieldDef): field is RadioGroupFieldDef =>
  field.type === 'radio-group'
export const isEmojiField = (field: FieldDef): field is EmojiFieldDef => field.type === 'emoji'
export const isSliderField = (field: FieldDef): field is SliderFieldDef => field.type === 'slider'
export const isImageUploadField = (field: FieldDef): field is ImageUploadFieldDef =>
  field.type === 'image-upload'
export const isArrayField = (field: FieldDef): field is ArrayFieldDef => field.type === 'array'
export const isFieldGroup = (field: FieldDef): field is FieldGroupDef =>
  field.type === 'field-group'
export const isTabsField = (field: FieldDef): field is TabsFieldDef => field.type === 'tabs'
export const isCardField = (field: FieldDef): field is CardFieldDef => field.type === 'card'
export const isComponentField = (field: FieldDef): field is ComponentFieldDef =>
  field.type === 'component'

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
