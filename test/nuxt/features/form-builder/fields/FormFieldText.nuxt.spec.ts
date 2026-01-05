import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import FormFieldText from '~/features/form-builder/fields/FormFieldText.vue'
import type { TextFieldMeta, FieldContext } from '~/features/form-builder/types'
import { mountFormField } from '../test-utils'

// Helper to mount FormFieldText with complete form-builder context
async function mountFormFieldText(meta: Partial<TextFieldMeta> = {}, modelValue?: string) {
  const defaultMeta: TextFieldMeta = {
    type: 'text',
    label: 'Test Field',
    ...meta
  }

  const { wrapper } = await mountFormField(FormFieldText, {
    meta: defaultMeta,
    modelValue: modelValue ?? '',
    errors: [],
    name: 'testField',
    onBlur: vi.fn()
  })

  return wrapper
}

describe('FormFieldText - Normal Operation', () => {
  it('renders with basic props', async () => {
    const wrapper = await mountFormFieldText({
      label: 'Username',
      placeholder: 'Enter username'
    })

    expect(wrapper.find('label').text()).toContain('Username')
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter username')
  })

  it('displays initial modelValue', async () => {
    const wrapper = await mountFormFieldText({}, 'John Doe')

    const input = wrapper.find('input')
    expect(input.element.value).toBe('John Doe')
  })

  it('emits update:modelValue when input changes', async () => {
    const onUpdateModelValue = vi.fn()
    const { wrapper } = await mountFormField(FormFieldText, {
      meta: { type: 'text', label: 'Test Field' },
      modelValue: '',
      errors: [],
      name: 'testField',
      onUpdateModelValue
    })
    const input = wrapper.find('input')

    await input.setValue('New Value')
    await nextTick()

    // Verify the update handler was called with the new value
    expect(onUpdateModelValue).toHaveBeenCalledWith('New Value')
  })

  it('shows optional indicator when optional is true', async () => {
    const wrapper = await mountFormFieldText({
      label: 'Optional Field',
      optional: true
    })

    expect(wrapper.text()).toContain('(optional)')
  })

  it('displays description text', async () => {
    const wrapper = await mountFormFieldText({
      description: 'This is a helpful description'
    })

    expect(wrapper.text()).toContain('This is a helpful description')
  })

  it('respects maxLength attribute', async () => {
    const wrapper = await mountFormFieldText({
      maxLength: 10
    })

    const input = wrapper.find('input')
    expect(input.attributes('maxlength')).toBe('10')
  })

  it('applies autocomplete attribute', async () => {
    const wrapper = await mountFormFieldText({
      autocomplete: 'email'
    })

    const input = wrapper.find('input')
    expect(input.attributes('autocomplete')).toBe('email')
  })

  it('applies custom CSS classes', async () => {
    const wrapper = await mountFormFieldText({
      class: 'custom-input-class',
      labelClass: 'custom-label-class',
      descriptionClass: 'custom-description-class',
      description: 'Test'
    })

    expect(wrapper.find('input').classes()).toContain('custom-input-class')
    expect(wrapper.find('label').classes()).toContain('custom-label-class')
    const description = wrapper.find('[class*="description"]')
    expect(description.classes()).toContain('custom-description-class')
  })
})

describe('FormFieldText - Dynamic Properties', () => {
  it('resolves dynamic label from function', async () => {
    const wrapper = await mountFormFieldText({
      label: (ctx) => `Dynamic Label: ${ctx.values.type || 'default'}`
    })

    expect(wrapper.find('label').text()).toContain('Dynamic Label: default')
  })

  it('resolves dynamic description from function', async () => {
    const wrapper = await mountFormFieldText({
      description: (ctx) => `Count: ${ctx.values.count || 0}`
    })

    expect(wrapper.text()).toContain('Count: 0')
  })

  it('resolves dynamic placeholder from function', async () => {
    const wrapper = await mountFormFieldText({
      placeholder: (ctx) => `Enter ${ctx.values.fieldType || 'value'}`
    })

    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('Enter value')
  })

  it('resolves dynamic disabled from function', async () => {
    const wrapper = await mountFormFieldText({
      disabled: (ctx) => ctx.values.locked === true
    })

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeUndefined()
  })

  it('disables input when disabled function returns true', async () => {
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
})

describe('FormFieldText - Error Handling', () => {
  it('displays validation errors', async () => {
    const { wrapper } = await mountFormField(FormFieldText, {
      meta: { type: 'text', label: 'Test Field' },
      modelValue: '',
      errors: ['This field is required'],
      name: 'testField'
    })

    expect(wrapper.text()).toContain('This field is required')
  })

  it('sets aria-invalid when errors present', async () => {
    const { wrapper } = await mountFormField(FormFieldText, {
      meta: { type: 'text' },
      modelValue: '',
      errors: ['Error message'],
      name: 'testField'
    })

    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('does not set aria-invalid when no errors', async () => {
    const wrapper = await mountFormFieldText()

    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBe('false')
  })

  it('displays first error when multiple errors present', async () => {
    const { wrapper } = await mountFormField(FormFieldText, {
      meta: { type: 'text', label: 'Test Field' },
      modelValue: '',
      errors: ['First error', 'Second error', 'Third error'],
      name: 'testField'
    })

    // Check that first error is shown
    expect(wrapper.text()).toContain('First error')
    // Second and third errors should not be displayed
    expect(wrapper.text()).not.toContain('Second error')
    expect(wrapper.text()).not.toContain('Third error')
  })
})

describe('FormFieldText - Edge Cases', () => {
  it('handles empty string modelValue', async () => {
    const wrapper = await mountFormFieldText({}, '')

    const input = wrapper.find('input')
    expect(input.element.value).toBe('')
  })

  it('handles undefined modelValue', async () => {
    const { wrapper } = await mountFormField(FormFieldText, {
      meta: { type: 'text' },
      modelValue: undefined,
      errors: [],
      name: 'testField'
    })

    const input = wrapper.find('input')
    expect(input.element.value).toBe('')
  })

  it('handles very long text input', async () => {
    const longText = 'a'.repeat(1000)
    const wrapper = await mountFormFieldText({}, longText)

    const input = wrapper.find('input')
    expect(input.element.value).toBe(longText)
  })

  it('handles special characters in input', async () => {
    const specialChars = '!@#$%^&*()_+-={}[]|:;"<>,.?/~`'
    const wrapper = await mountFormFieldText({}, specialChars)

    const input = wrapper.find('input')
    expect(input.element.value).toBe(specialChars)
  })

  it('handles unicode characters', async () => {
    const unicode = '你好世界 🌍 Привет мир'
    const wrapper = await mountFormFieldText({}, unicode)

    const input = wrapper.find('input')
    expect(input.element.value).toBe(unicode)
  })

  it('handles numeric modelValue', async () => {
    const { wrapper } = await mountFormField(FormFieldText, {
      meta: { type: 'text' },
      modelValue: 12345,
      errors: [],
      name: 'testField'
    })

    const input = wrapper.find('input')
    expect(input.element.value).toBe('12345')
  })

  it('handles rapid value changes', async () => {
    const onUpdateModelValue = vi.fn()
    const { wrapper } = await mountFormField(FormFieldText, {
      meta: { type: 'text', label: 'Test Field' },
      modelValue: '',
      errors: [],
      name: 'testField',
      onUpdateModelValue
    })
    const input = wrapper.find('input')

    // Simulate rapid typing
    await input.setValue('a')
    await input.setValue('ab')
    await input.setValue('abc')
    await nextTick()

    // Verify multiple updates were triggered
    expect(onUpdateModelValue).toHaveBeenCalled()
    expect(onUpdateModelValue).toHaveBeenCalledWith('abc')
    expect(onUpdateModelValue.mock.calls.length).toBeGreaterThanOrEqual(3)
  })

  it('applies disabled attribute when disabled is true', async () => {
    const wrapper = await mountFormFieldText({
      disabled: true
    })

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('calls onBlur when input loses focus', async () => {
    const onBlur = vi.fn()
    const { wrapper } = await mountFormField(FormFieldText, {
      meta: { type: 'text' },
      modelValue: '',
      errors: [],
      name: 'testField',
      onBlur
    })

    const input = wrapper.find('input')
    await input.trigger('blur')

    expect(onBlur).toHaveBeenCalled()
  })

  it('handles missing label gracefully', async () => {
    const wrapper = await mountFormFieldText({
      label: undefined
    })

    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('handles missing placeholder gracefully', async () => {
    const wrapper = await mountFormFieldText({
      placeholder: undefined
    })

    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBeUndefined()
  })
})

describe('FormFieldText - Accessibility', () => {
  it('associates label with input via for/id using field name', async () => {
    const wrapper = await mountFormFieldText({
      label: 'Accessible Field'
    })

    const label = wrapper.find('label')
    const input = wrapper.find('input')

    // In production, FormField.vue auto-generates id from vee-validate path
    // In tests, we pass name directly so id falls back to name
    expect(label.attributes('for')).toBe('testField')
    expect(input.attributes('id')).toBe('testField')
  })

  it('renders as text input element', async () => {
    const wrapper = await mountFormFieldText()

    const input = wrapper.find('input')
    // Check that it's rendered as an input element
    expect(input.element.tagName).toBe('INPUT')
    // The shadcn Input component doesn't set explicit type="text" (browser default)
    expect(input.exists()).toBe(true)
  })
})

describe('FormFieldText - Form Submission', () => {
  it('prevents form submission on Enter key', async () => {
    const wrapper = await mountFormFieldText({
      label: 'Test Field'
    })

    const input = wrapper.find('input')
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      cancelable: true
    })

    // Trigger Enter key
    await input.element.dispatchEvent(enterEvent)
    await nextTick()

    // Verify event was prevented (form should not submit)
    expect(enterEvent.defaultPrevented).toBe(true)
  })
})

describe('FormFieldText - Integration', () => {
  it('works with all metadata properties combined', async () => {
    const wrapper = await mountFormFieldText(
      {
        label: 'Full Featured Field',
        description: 'This field has all features',
        placeholder: 'Type here...',
        optional: true,
        maxLength: 50,
        autocomplete: 'username',
        class: 'custom-class',
        labelClass: 'label-custom',
        descriptionClass: 'desc-custom'
      },
      'Initial Value'
    )

    // Verify all properties are applied
    expect(wrapper.find('label').text()).toContain('Full Featured Field')
    expect(wrapper.text()).toContain('This field has all features')
    expect(wrapper.text()).toContain('(optional)')
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('Type here...')
    expect(input.attributes('maxlength')).toBe('50')
    expect(input.attributes('autocomplete')).toBe('username')
    expect(input.element.value).toBe('Initial Value')
  })

  it('handles complete user interaction flow', async () => {
    const onBlur = vi.fn()
    const onUpdateModelValue = vi.fn()
    const { wrapper } = await mountFormField(FormFieldText, {
      meta: {
        type: 'text',
        label: 'Interactive Field',
        placeholder: 'Start typing...'
      },
      modelValue: '',
      errors: [],
      name: 'testField',
      onBlur,
      onUpdateModelValue
    })

    const input = wrapper.find('input')

    // 1. Focus
    await input.trigger('focus')

    // 2. Type
    await input.setValue('User Input')
    await nextTick()

    // 3. Verify update callback was called
    expect(onUpdateModelValue).toHaveBeenCalledWith('User Input')

    // 4. Blur
    await input.trigger('blur')
    expect(onBlur).toHaveBeenCalled()
  })
})
