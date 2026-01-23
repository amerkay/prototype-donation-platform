import { describe, it, expect } from 'vitest'
import { nextTick, ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { useCustomFieldsForm } from '~/features/_library/custom-fields/utils'
import type { CustomFieldDefinition } from '~/features/_library/custom-fields/types'

async function waitForUpdate() {
  await nextTick()
  await nextTick()
  await nextTick()
}

describe('Custom Fields - onVisibilityChange clearValue', () => {
  /**
   * Core test: Custom field value is cleared when visibility condition becomes false.
   * This is the primary behavior of onVisibilityChange + clearValue.
   */
  it('clears field value when custom field becomes hidden', async () => {
    const customFields: CustomFieldDefinition[] = [
      {
        id: 'company_name',
        type: 'text',
        label: 'Company Name',
        advancedSettings: { optional: false },
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            conditions: [{ field: 'showCompany', operator: 'isTrue' }],
            match: 'all'
          }
        }
      }
    ]

    const formSection = useCustomFieldsForm(customFields)
    const formData = ref({ company_name: 'Acme Corp' })
    const externalContext = ref({ showCompany: true })

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: formSection,
        modelValue: formData.value,
        context: externalContext.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          formData.value = value as typeof formData.value
        }
      }
    })

    await waitForUpdate()

    // Verify field is visible with value
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('Acme Corp')

    // Hide the field by changing context
    externalContext.value = { showCompany: false }
    await wrapper.setProps({ context: externalContext.value })
    await waitForUpdate()

    // Field should be hidden
    expect(wrapper.find('input').exists()).toBe(false)

    // Value should be cleared
    expect(formData.value.company_name).toBeUndefined()
  })

  /**
   * CRITICAL TEST: This test MUST FAIL if clearValue is commented out in utils.ts.
   *
   * Without clearValue, using setValue would:
   * 1. Trigger validation via providedSetFieldValue (marks touched)
   * 2. Show validation errors for the now-hidden field
   *
   * With clearValue:
   * 1. Field is cleared silently (no validation trigger)
   * 2. Field state is reset (not touched/dirty)
   * 3. No validation errors appear
   */
  it('does not trigger validation errors when clearing hidden field', async () => {
    const customFields: CustomFieldDefinition[] = [
      {
        id: 'required_field',
        type: 'text',
        label: 'Required Field',
        advancedSettings: { optional: false }, // This makes it required
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            conditions: [{ field: 'showField', operator: 'isTrue' }],
            match: 'all'
          }
        }
      }
    ]

    const formSection = useCustomFieldsForm(customFields)
    const formData = ref({ required_field: 'valid value' })
    const externalContext = ref({ showField: true })

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: formSection,
        modelValue: formData.value,
        context: externalContext.value,
        validateOnMount: true, // Enable validation
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          formData.value = value as typeof formData.value
        }
      }
    })

    await waitForUpdate()

    // Field is visible with valid value - no errors
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('required')

    // Hide the field
    externalContext.value = { showField: false }
    await wrapper.setProps({ context: externalContext.value })
    await waitForUpdate()

    // CRITICAL: No validation error should appear
    // If clearValue is replaced with setValue, this would trigger validation
    // and potentially show "required" error for the cleared field
    expect(wrapper.text()).not.toContain('required')
    expect(wrapper.text()).not.toContain('Required')
    expect(wrapper.text()).not.toContain('error')
  })

  /**
   * Data integrity test: Ensures form data is actually clean after hiding.
   * The cleared field should be undefined (removed), not empty string.
   */
  it('produces clean form data with undefined for hidden cleared fields', async () => {
    const customFields: CustomFieldDefinition[] = [
      {
        id: 'conditional_text',
        type: 'text',
        label: 'Conditional Text',
        advancedSettings: { optional: true },
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            conditions: [{ field: 'enabled', operator: 'isTrue' }],
            match: 'all'
          }
        }
      },
      {
        id: 'always_visible',
        type: 'text',
        label: 'Always Visible',
        advancedSettings: { optional: true }
        // No visibility conditions - always visible
      }
    ]

    const formSection = useCustomFieldsForm(customFields)
    const formData = ref({
      conditional_text: 'will be cleared',
      always_visible: 'stays'
    })
    const externalContext = ref({ enabled: true })

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: formSection,
        modelValue: formData.value,
        context: externalContext.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          formData.value = value as typeof formData.value
        }
      }
    })

    await waitForUpdate()

    // Both fields visible
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(2)

    // Hide conditional field
    externalContext.value = { enabled: false }
    await wrapper.setProps({ context: externalContext.value })
    await waitForUpdate()

    // Only one field visible now
    expect(wrapper.findAll('input').length).toBe(1)

    // Verify data integrity
    expect(formData.value.conditional_text).toBeUndefined()
    expect(formData.value.always_visible).toBe('stays')
  })
})
