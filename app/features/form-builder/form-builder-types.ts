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
  | 'radio-group'
  | 'array'
  | 'emoji'
  | 'field-group'
  | 'card'

/**
 * Base field metadata
 */
export interface BaseFieldMeta {
  type: FieldType
  label?: string
  description?: string | ((values: Record<string, unknown>) => string)
  placeholder?: string
  optional?: boolean
  visibleWhen?: (values: Record<string, unknown>) => boolean
  isNoSeparatorAfter?: boolean
  class?: string
  labelClass?: string
  classDescription?: string
  rules?: z.ZodTypeAny | ((values: Record<string, unknown>) => z.ZodTypeAny)
  onChange?: (
    value: unknown,
    allValues: Record<string, unknown>,
    setValue: (path: string, value: unknown) => void
  ) => void
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
 * Select/Combobox field metadata
 */
export interface SelectFieldMeta extends BaseFieldMeta {
  type: 'select'
  options: ReadonlyArray<{ value: string | number; label: string }>
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
 * Card field metadata - informational display card
 */
export interface CardFieldMeta extends BaseFieldMeta {
  type: 'card'
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
  | RadioGroupFieldMeta
  | ArrayFieldMeta
  | EmojiFieldMeta
  | CardFieldMeta
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
