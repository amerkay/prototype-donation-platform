import type { z } from 'zod'
import type { Component } from 'vue'
import type {
  ComposableForm,
  FormContext,
  TextFieldConfig,
  TextFieldDef,
  TextareaFieldConfig,
  TextareaFieldDef,
  NumberFieldConfig,
  NumberFieldDef,
  CurrencyFieldConfig,
  CurrencyFieldDef,
  ToggleFieldConfig,
  ToggleFieldDef,
  CheckboxFieldConfig,
  CheckboxFieldDef,
  SelectFieldConfig,
  SelectFieldDef,
  ComboboxFieldConfig,
  ComboboxFieldDef,
  AutocompleteFieldConfig,
  AutocompleteFieldDef,
  RadioGroupFieldConfig,
  RadioGroupFieldDef,
  DateFieldConfig,
  DateFieldDef,
  EmojiFieldConfig,
  EmojiFieldDef,
  ColorFieldConfig,
  ColorFieldDef,
  SliderFieldConfig,
  SliderFieldDef,
  ImageUploadFieldConfig,
  ImageUploadFieldDef,
  HiddenFieldConfig,
  HiddenFieldDef,
  ArrayFieldConfig,
  ArrayFieldDef,
  FieldGroupConfig,
  FieldGroupDef,
  TabsFieldConfig,
  TabsFieldDef,
  CardFieldConfig,
  CardFieldDef,
  ComponentFieldConfig,
  ComponentFieldDef,
  FieldDef
} from '../types'

// ============================================================================
// CORE: defineForm
// ============================================================================

/**
 * Define a form using Composition API pattern
 * Provides reactive context for dynamic field configuration
 *
 * @param id - Unique form identifier
 * @param setup - Setup function that receives FormContext and returns field definitions
 * @returns ComposableForm object for use with FormRenderer
 *
 * @example
 * ```ts
 * export const useMyForm = defineForm('my-form', (ctx) => {
 *   ctx.title = 'My Form'
 *   ctx.description = 'Fill out the details'
 *
 *   const firstName = textField('firstName', {
 *     label: 'First Name',
 *     rules: z.string().min(1)
 *   })
 *
 *   const lastName = textField('lastName', {
 *     label: 'Last Name',
 *     rules: z.string().min(1)
 *   })
 *
 *   return { firstName, lastName }
 * })
 * ```
 */
export function defineForm<T extends z.ZodTypeAny = z.ZodTypeAny>(
  id: string,
  setup: (ctx: FormContext) => Record<string, FieldDef>,
  schema?: T
): ComposableForm<T> {
  return {
    id,
    schema,
    setup,
    _meta: {}
  }
}

// ============================================================================
// FIELD CONSTRUCTORS
// ============================================================================

/**
 * Create a text input field
 */
export function textField(name: string, config: TextFieldConfig): TextFieldDef {
  return {
    type: 'text',
    name,
    ...config
  }
}

/**
 * Create a textarea field
 */
export function textareaField(name: string, config: TextareaFieldConfig): TextareaFieldDef {
  return {
    type: 'textarea',
    name,
    ...config
  }
}

/**
 * Create a number input field
 */
export function numberField(name: string, config: NumberFieldConfig): NumberFieldDef {
  return {
    type: 'number',
    name,
    ...config
  }
}

/**
 * Create a currency input field
 */
export function currencyField(name: string, config: CurrencyFieldConfig): CurrencyFieldDef {
  return {
    type: 'currency',
    name,
    ...config
  }
}

/**
 * Create a hidden input field for tracking/analytics
 */
export function hiddenField(name: string, config: HiddenFieldConfig = {}): HiddenFieldDef {
  return {
    type: 'hidden',
    name,
    ...config
  }
}

/**
 * Create a toggle/switch field
 */
export function toggleField(name: string, config: ToggleFieldConfig = {}): ToggleFieldDef {
  return {
    type: 'toggle',
    name,
    ...config
  }
}

/**
 * Create a checkbox field (single or array)
 */
export function checkboxField(name: string, config: CheckboxFieldConfig = {}): CheckboxFieldDef {
  return {
    type: 'checkbox',
    name,
    ...config
  }
}

/**
 * Create a select dropdown field
 */
export function selectField(name: string, config: SelectFieldConfig): SelectFieldDef {
  return {
    type: 'select',
    name,
    ...config
  }
}

/**
 * Create a combobox (searchable select) field
 */
export function comboboxField(name: string, config: ComboboxFieldConfig): ComboboxFieldDef {
  return {
    type: 'combobox',
    name,
    ...config
  }
}

/**
 * Create an autocomplete field
 */
export function autocompleteField(
  name: string,
  config: AutocompleteFieldConfig
): AutocompleteFieldDef {
  return {
    type: 'autocomplete',
    name,
    ...config
  }
}

/**
 * Create a radio group field
 */
export function radioGroupField(name: string, config: RadioGroupFieldConfig): RadioGroupFieldDef {
  return {
    type: 'radio-group',
    name,
    ...config
  }
}

/**
 * Create a date picker field
 */
export function dateField(name: string, config: DateFieldConfig): DateFieldDef {
  return {
    type: 'date',
    name,
    ...config
  }
}

/**
 * Create an emoji input field
 */
export function emojiField(name: string, config: EmojiFieldConfig = {}): EmojiFieldDef {
  return {
    type: 'emoji',
    name,
    ...config
  }
}

/**
 * Create a color picker field (swatch + hex input)
 */
export function colorField(name: string, config: ColorFieldConfig = {}): ColorFieldDef {
  return {
    type: 'color',
    name,
    ...config
  }
}

/**
 * Create a slider field
 */
export function sliderField(name: string, config: SliderFieldConfig): SliderFieldDef {
  return {
    type: 'slider',
    name,
    ...config
  }
}

/**
 * Create an image upload field
 */
export function imageUploadField(
  name: string,
  config: ImageUploadFieldConfig = {}
): ImageUploadFieldDef {
  return {
    type: 'image-upload',
    name,
    ...config
  }
}

/**
 * Create an array field (repeatable items)
 */
export function arrayField(name: string, config: ArrayFieldConfig): ArrayFieldDef {
  return {
    type: 'array',
    name,
    ...config
  }
}

/**
 * Create a field group (horizontal grouping)
 */
export function fieldGroup(name: string, config: FieldGroupConfig): FieldGroupDef {
  return {
    type: 'field-group',
    name,
    ...config
  }
}

/**
 * Create a tabs field
 */
export function tabsField(name: string, config: TabsFieldConfig): TabsFieldDef {
  return {
    type: 'tabs',
    name,
    ...config
  }
}

/**
 * Create a card field (display only)
 */
export function cardField(name: string, config: CardFieldConfig = {}): CardFieldDef {
  return {
    type: 'card',
    name,
    ...config
  }
}

/**
 * Create a component field (renders custom Vue component)
 * Allows injecting arbitrary components into forms with full visibility/validation support
 *
 * @example
 * ```ts
 * const formsList = componentField('formsList', {
 *   label: 'Donation Forms',
 *   component: FormsList,
 *   props: { showActions: true },
 *   visibleWhen: ({ values }) => values.enabled
 * })
 * ```
 */
export function componentField<TProps = Record<string, unknown>>(
  name: string,
  config: Omit<ComponentFieldConfig<TProps>, 'component'> & { component: Component }
): ComponentFieldDef<TProps> {
  return {
    type: 'component',
    name,
    ...config
  }
}
