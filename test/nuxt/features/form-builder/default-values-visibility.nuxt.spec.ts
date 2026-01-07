import { describe, it, expect } from 'vitest'
import { nextTick, ref } from 'vue'
import FormField from '~/features/form-builder/FormField.vue'
import { mountFormField, getSectionValues } from './test-utils'

describe('FormField - Default Values Visibility Logic', () => {
  it('applies defaultValue when field becomes visible if current value is undefined', async () => {
    // We use a ref to control visibility dynamically via a closure in visibleWhen
    const showField = ref(false)

    const { wrapper, formValues } = await mountFormField(FormField, {
      meta: {
        type: 'text',
        label: 'Dynamic Field',
        defaultValue: 'Default Value',
        // Field is visible only when our external ref is true
        visibleWhen: () => showField.value
      },
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
        meta: {
          type: 'text',
          label: 'Dynamic Field',
          defaultValue: 'Default Value',
          visibleWhen: () => showField.value
        },
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
      meta: {
        type: 'text',
        label: 'Static Field',
        defaultValue: 'Initial Default'
        // visible by default
      },
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
