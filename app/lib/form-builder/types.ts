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
  | 'object'
  | 'array'

/**
 * Base field metadata
 */
export interface BaseFieldMeta {
  type: FieldType
  label?: string
  description?: string
  placeholder?: string
  optional?: boolean
  visibleWhen?: (values: Record<string, unknown>) => boolean
  class?: string
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
 * Object field metadata (nested fields)
 */
export interface ObjectFieldMeta extends BaseFieldMeta {
  type: 'object'
  fields: FieldMetaMap
  legend?: string
  showBorder?: boolean
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
 * Union of all field metadata types
 */
export type FieldMeta =
  | TextFieldMeta
  | TextareaFieldMeta
  | NumberFieldMeta
  | ToggleFieldMeta
  | SelectFieldMeta
  | RadioGroupFieldMeta
  | ObjectFieldMeta
  | ArrayFieldMeta

/**
 * Map of field paths to their metadata
 */
export type FieldMetaMap = Record<string, FieldMeta>

/**
 * Config section definition
 */
export interface ConfigSectionDef<T extends z.ZodTypeAny = z.ZodTypeAny> {
  id: string
  title: string
  description?: string
  schema: T
  fields: FieldMetaMap
  defaultValue?: z.infer<T>
}
