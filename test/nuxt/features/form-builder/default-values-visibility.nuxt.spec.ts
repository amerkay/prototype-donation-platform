import { describe, it, expect, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import FormField from '~/features/form-builder/FormField.vue'
import { textField } from '~/features/form-builder/api'
import { mountFormField, getSectionValues } from './test-utils'

describe('FormField - Default Values Visibility Logic', () => {
  it('applies defaultValue when field becomes visible if current value is undefined', async () => {
    // We use a ref to control visibility dynamically via a closure in visibleWhen
    const showField = ref(false)

    const { wrapper, formValues } = await mountFormField(FormField, {
      meta: textField('testField', {
        label: 'Dynamic Field',
        defaultValue: 'Default Value',
        // Field is visible only when our external ref is true
        visibleWhen: () => showField.value
      }),
      name: 'testField',
      errors: []
    })

    // 1. Initial state: hidden
    expect(wrapper.find('input').exists()).toBe(false)
    // Value should be undefined as it wasn't in initialValues
    expect(getSectionValues(formValues)?.testField).toBeUndefined()

    // 2. Make visible
    showField.value = true

    // Wait for multiple ticks to ensure reactivity, the watcher in FormField,
    // and vee-validate state updates all settle
    await nextTick()
    await nextTick()
    await nextTick()

    // 3. Should now be visible and have default value applied
    expect(wrapper.find('input').exists()).toBe(true)
    expect(getSectionValues(formValues)?.testField).toBe('Default Value')
    expect(wrapper.find('input').element.value).toBe('Default Value')
  })

  it('does NOT overwrite existing value when becoming visible', async () => {
    const showField = ref(false)

    const { wrapper, formValues } = await mountFormField(
      FormField,
      {
        meta: textField('testField', {
          label: 'Dynamic Field',
          defaultValue: 'Default Value',
          visibleWhen: () => showField.value
        }),
        name: 'testField',
        errors: []
      },
      {
        initialValues: {
          testField: 'Existing Value'
        }
      }
    )

    // 1. Initially hidden but has value
    expect(getSectionValues(formValues)?.testField).toBe('Existing Value')

    // 2. Make visible
    showField.value = true
    await nextTick()
    await nextTick()
    await nextTick()

    // 3. Should NOT be overwritten by the defaultValue even though it became visible
    expect(getSectionValues(formValues)?.testField).toBe('Existing Value')
    expect(wrapper.find('input').element.value).toBe('Existing Value')
  })

  it('applies defaultValue on mount if initially visible', async () => {
    const { formValues } = await mountFormField(FormField, {
      meta: textField('testField', {
        label: 'Static Field',
        defaultValue: 'Initial Default'
        // visible by default
      }),
      name: 'testField',
      errors: []
    })

    // Need a tick for the immediate watch to run
    await nextTick()
    await nextTick()
    await nextTick()

    expect(getSectionValues(formValues)?.testField).toBe('Initial Default')
  })
})

describe('FormField - onVisibilityChange Callback', () => {
  it('calls onVisibilityChange with clearValue when field becomes hidden', async () => {
    const showField = ref(true)
    const callback = vi.fn()

    await mountFormField(
      FormField,
      {
        meta: textField('testField', {
          label: 'Conditional Field',
          defaultValue: 'Initial',
          visibleWhen: () => showField.value,
          onVisibilityChange: callback
        }),
        name: 'testField',
        errors: []
      },
      {
        initialValues: {
          testField: 'Test Value'
        }
      }
    )

    await nextTick()
    await nextTick()

    // Should have been called on mount (immediate: true)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        visible: true,
        value: 'Test Value',
        path: 'testField'
      })
    )

    callback.mockClear()

    // Hide the field
    showField.value = false
    await nextTick()
    await nextTick()
    await nextTick()

    // Should be called with visible: false
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        visible: false,
        value: 'Test Value',
        path: 'testField'
      })
    )

    // Verify clearValue function is provided
    const callArgs = callback.mock.calls[0]?.[0] as Record<string, unknown>
    expect(typeof callArgs.clearValue).toBe('function')
    expect(typeof callArgs.setValue).toBe('function')
  })

  it('clears field value when clearValue is called from callback', async () => {
    const showField = ref(true)

    const { formValues } = await mountFormField(
      FormField,
      {
        meta: textField('testField', {
          label: 'Conditional Field',
          visibleWhen: () => showField.value,
          onVisibilityChange: ({ visible, clearValue }) => {
            if (!visible) {
              clearValue('testField')
            }
          }
        }),
        name: 'testField',
        errors: []
      },
      {
        initialValues: {
          testField: 'Will Be Cleared'
        }
      }
    )

    await nextTick()
    await nextTick()

    expect(getSectionValues(formValues)?.testField).toBe('Will Be Cleared')

    // Hide the field - should trigger clearValue
    showField.value = false
    await nextTick()
    await nextTick()
    await nextTick()

    // Value should be cleared
    expect(getSectionValues(formValues)?.testField).toBeUndefined()
  })

  it('does not trigger validation when clearValue is used', async () => {
    const showField = ref(true)

    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: textField('testField', {
          label: 'Required Field',
          rules: (await import('zod')).z.string().min(3, 'Min 3 chars'),
          visibleWhen: () => showField.value,
          onVisibilityChange: ({ visible, clearValue }) => {
            if (!visible) {
              clearValue('testField')
            }
          }
        }),
        name: 'testField',
        errors: []
      },
      {
        initialValues: {
          testField: 'ab' // Invalid: only 2 chars
        }
      }
    )

    await nextTick()
    await nextTick()

    // Field is visible with invalid value
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)

    // Trigger validation
    await input.trigger('blur')
    await nextTick()
    await nextTick()

    const result1 = await validate()
    expect(result1.valid).toBe(false)

    // Hide the field - clearValue should NOT trigger validation error flash
    showField.value = false
    await nextTick()
    await nextTick()
    await nextTick()

    // Field should be hidden and no error should be visible
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Min 3 chars')

    // Form should be valid (hidden field doesn't count)
    const result2 = await validate()
    expect(result2.valid).toBe(true)
  })

  it('preserves value when field remains visible after condition re-evaluation', async () => {
    const condition = ref(true)
    const callback = vi.fn()

    const { formValues } = await mountFormField(
      FormField,
      {
        meta: textField('testField', {
          label: 'Conditional Field',
          visibleWhen: () => condition.value,
          onVisibilityChange: callback
        }),
        name: 'testField',
        errors: []
      },
      {
        initialValues: {
          testField: 'Important Data'
        }
      }
    )

    await nextTick()
    await nextTick()

    // Initial call on mount
    expect(callback).toHaveBeenCalledTimes(1)
    callback.mockClear()

    // Trigger re-evaluation but keep visible
    condition.value = true // Same value, but triggers reactivity
    await nextTick()
    await nextTick()

    // Callback should NOT be called (visible didn't change from true to true)
    expect(callback).toHaveBeenCalledTimes(0)

    // Value should be preserved
    expect(getSectionValues(formValues)?.testField).toBe('Important Data')
  })
})
