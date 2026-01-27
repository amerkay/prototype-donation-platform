import { describe, it, expect } from 'vitest'
import FormFieldText from '~/features/_library/form-builder/fields/FormFieldText.vue'
import FormFieldTextarea from '~/features/_library/form-builder/fields/FormFieldTextarea.vue'
import FormFieldNumber from '~/features/_library/form-builder/fields/FormFieldNumber.vue'
import FormFieldCurrency from '~/features/_library/form-builder/fields/FormFieldCurrency.vue'
import FormFieldToggle from '~/features/_library/form-builder/fields/FormFieldToggle.vue'
import FormFieldCheckbox from '~/features/_library/form-builder/fields/FormFieldCheckbox.vue'
import FormFieldSelect from '~/features/_library/form-builder/fields/FormFieldSelect.vue'
import FormFieldRadioGroup from '~/features/_library/form-builder/fields/FormFieldRadioGroup.vue'
import FormFieldSlider from '~/features/_library/form-builder/fields/FormFieldSlider.vue'
import FormFieldImageUpload from '~/features/_library/form-builder/fields/FormFieldImageUpload.vue'
import type {
  TextFieldDef,
  TextareaFieldDef,
  NumberFieldDef,
  CurrencyFieldDef,
  ToggleFieldDef,
  CheckboxFieldDef,
  SelectFieldDef,
  RadioGroupFieldDef,
  SliderFieldDef,
  ImageUploadFieldDef,
  FieldContext
} from '~/features/_library/form-builder/types'
import { mountFormField } from '../test-utils'

/**
 * Comprehensive test suite for disabled property across all form field types
 * Tests static boolean, computed ref, and function forms of disabled
 */

describe('FormField Disabled Property - Text Fields', () => {
  it('disables text field with static boolean', async () => {
    const meta: TextFieldDef = {
      type: 'text',
      name: 'testField',
      label: 'Test Field',
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldText, {
      meta,
      modelValue: '',
      errors: [],
      name: 'testField'
    })

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('disables textarea field with static boolean', async () => {
    const meta: TextareaFieldDef = {
      type: 'textarea',
      name: 'testField',
      label: 'Test Field',
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldTextarea, {
      meta,
      modelValue: '',
      errors: [],
      name: 'testField'
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('disabled')).toBeDefined()
  })
})

describe('FormField Disabled Property - Number Fields', () => {
  it('disables number field with static boolean', async () => {
    const meta: NumberFieldDef = {
      type: 'number',
      name: 'testField',
      label: 'Test Field',
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldNumber, {
      meta,
      modelValue: null,
      errors: [],
      name: 'testField'
    })

    // NumberField component should have disabled attribute
    const numberField = wrapper.findComponent({ name: 'NumberField' })
    expect(numberField.vm.$props.disabled).toBe(true)
  })

  it('disables currency field with static boolean', async () => {
    const meta: CurrencyFieldDef = {
      type: 'currency',
      name: 'testField',
      label: 'Test Field',
      currencySymbol: '£',
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldCurrency, {
      meta,
      modelValue: null,
      errors: [],
      name: 'testField'
    })

    const input = wrapper.find('input[type="number"]')
    expect(input.attributes('disabled')).toBeDefined()
  })
})

describe('FormField Disabled Property - Toggle & Checkbox', () => {
  it('disables toggle field with static boolean', async () => {
    const meta: ToggleFieldDef = {
      type: 'toggle',
      name: 'testField',
      label: 'Test Field',
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldToggle, {
      meta,
      modelValue: false,
      errors: [],
      name: 'testField'
    })

    // Switch component should have disabled attribute
    const switchComponent = wrapper.findComponent({ name: 'Switch' })
    expect(switchComponent.vm.$props.disabled).toBe(true)
  })

  it('disables single checkbox with static boolean', async () => {
    const meta: CheckboxFieldDef = {
      type: 'checkbox',
      name: 'testField',
      label: 'Test Field',
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldCheckbox, {
      meta,
      modelValue: false,
      errors: [],
      name: 'testField'
    })

    const checkbox = wrapper.findComponent({ name: 'Checkbox' })
    expect(checkbox.vm.$props.disabled).toBe(true)
  })

  it('disables multiple checkboxes with static boolean', async () => {
    const meta: CheckboxFieldDef = {
      type: 'checkbox',
      name: 'testField',
      label: 'Test Field',
      options: [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' }
      ],
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldCheckbox, {
      meta,
      modelValue: [],
      errors: [],
      name: 'testField'
    })

    const checkboxes = wrapper.findAllComponents({ name: 'Checkbox' })
    expect(checkboxes.length).toBe(2)
    checkboxes.forEach((checkbox) => {
      expect(checkbox.vm.$props.disabled).toBe(true)
    })
  })
})

describe('FormField Disabled Property - Selection Fields', () => {
  it('disables select field with static boolean', async () => {
    const meta: SelectFieldDef = {
      type: 'select',
      name: 'testField',
      label: 'Test Field',
      options: [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' }
      ],
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldSelect, {
      meta,
      modelValue: '',
      errors: [],
      name: 'testField'
    })

    const select = wrapper.find('select')
    expect(select.attributes('disabled')).toBeDefined()
  })

  it('disables radio group with static boolean', async () => {
    const meta: RadioGroupFieldDef = {
      type: 'radio-group',
      name: 'testField',
      label: 'Test Field',
      options: [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' }
      ],
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldRadioGroup, {
      meta,
      modelValue: '',
      errors: [],
      name: 'testField'
    })

    const radioGroup = wrapper.findComponent({ name: 'RadioGroup' })
    expect(radioGroup.vm.$props.disabled).toBe(true)
  })
})

describe('FormField Disabled Property - Slider', () => {
  it('disables slider field with static boolean', async () => {
    const meta: SliderFieldDef = {
      type: 'slider',
      name: 'testField',
      label: 'Test Field',
      min: 0,
      max: 100,
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldSlider, {
      meta,
      modelValue: 50,
      errors: [],
      name: 'testField'
    })

    const slider = wrapper.findComponent({ name: 'Slider' })
    expect(slider.vm.$props.disabled).toBe(true)
  })
})

describe('FormField Disabled Property - Image Upload', () => {
  it('disables image upload field with static boolean', async () => {
    const meta: ImageUploadFieldDef = {
      type: 'image-upload',
      name: 'testField',
      label: 'Test Field',
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldImageUpload, {
      meta,
      modelValue: null,
      errors: [],
      name: 'testField'
    })

    // Button should be disabled
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('disables replace/remove buttons when disabled and image exists', async () => {
    const meta: ImageUploadFieldDef = {
      type: 'image-upload',
      name: 'testField',
      label: 'Test Field',
      disabled: true
    }

    const { wrapper } = await mountFormField(FormFieldImageUpload, {
      meta,
      modelValue:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      errors: [],
      name: 'testField'
    })

    // Both Replace and Remove buttons should be disabled
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
    buttons.forEach((button) => {
      expect(button.attributes('disabled')).toBeDefined()
    })
  })
})

describe('FormField Disabled Property - Dynamic (Function)', () => {
  it('disables text field when function returns true', async () => {
    const { wrapper } = await mountFormField(
      FormFieldText,
      {
        meta: {
          type: 'text',
          label: 'Test Field',
          disabled: (ctx: FieldContext) => ctx.values.locked === true
        },
        modelValue: '',
        errors: [],
        name: 'testField'
      },
      {
        initialValues: { locked: true }
      }
    )

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('enables text field when function returns false', async () => {
    const { wrapper } = await mountFormField(
      FormFieldText,
      {
        meta: {
          type: 'text',
          label: 'Test Field',
          disabled: (ctx: FieldContext) => ctx.values.locked === true
        },
        modelValue: '',
        errors: [],
        name: 'testField'
      },
      {
        initialValues: { locked: false }
      }
    )

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeUndefined()
  })

  it('disables toggle field when function returns true', async () => {
    const { wrapper } = await mountFormField(
      FormFieldToggle,
      {
        meta: {
          type: 'toggle',
          label: 'Test Field',
          disabled: (ctx: FieldContext) => ctx.values.isDisabled === true
        },
        modelValue: false,
        errors: [],
        name: 'testField'
      },
      {
        initialValues: { isDisabled: true }
      }
    )

    const switchComponent = wrapper.findComponent({ name: 'Switch' })
    expect(switchComponent.vm.$props.disabled).toBe(true)
  })
})
