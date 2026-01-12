/**
 * Test: Hidden fields with visibility conditions should be removed from form data
 * when conditions are not met
 */
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { computed } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { defineForm, textField, hiddenField, numberField } from '~/features/form-builder/api'
import type { ConditionGroup } from '~/features/form-builder/conditions'
import type { FormContext } from '~/features/form-builder/types'
import { extractCustomFieldDefaults, useCustomFieldsForm } from '~/features/custom-fields/utils'
import type { CustomFieldDefinition } from '~/features/custom-fields/types'

describe('Hidden Field Visibility Conditions', () => {
  it('should not include hidden field in form data when visibility condition is false on mount', async () => {
    // Create a form with a text field and a hidden field that should only be visible when text field >= 50
    const form = defineForm('testForm', () => ({
      amount: textField('amount', {
        label: 'Amount',
        defaultValue: '10' // Start with value < 50
      }),
      hiddenLargeDonor: hiddenField('hiddenLargeDonor', {
        label: 'is_large_donor',
        defaultValue: 'yes', // Default value that should be cleared
        visibleWhen: {
          conditions: [
            {
              field: 'amount',
              operator: 'greaterOrEqual',
              value: 50
            }
          ],
          match: 'all'
        } as ConditionGroup,
        onVisibilityChange: ({ visible, clearValue }) => {
          if (!visible) {
            clearValue('hiddenLargeDonor')
          }
        }
      })
    }))

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: form,
        modelValue: {}
      }
    })

    // Wait for reactivity to settle
    await wrapper.vm.$nextTick()

    // The hidden field should NOT be in the form data since amount (10) < 50
    const formData = wrapper.emitted('update:modelValue')?.[0]?.[0] as Record<string, unknown>

    expect(formData).toBeDefined()
    expect(formData.hiddenLargeDonor).toBeUndefined()
    expect(formData.amount).toBe('10')
  })

  it('extractCustomFieldDefaults should skip fields with visibility conditions', () => {
    const fields: CustomFieldDefinition[] = [
      {
        type: 'text',
        id: 'text_always_visible',
        label: 'Always Visible',
        defaultValue: 'default_text'
      },
      {
        type: 'hidden',
        id: 'hidden_with_conditions',
        label: 'is_large_donor',
        defaultValue: 'yes',
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            conditions: [
              {
                field: 'donationAmount',
                operator: 'greaterOrEqual',
                value: 50
              }
            ],
            match: 'all'
          }
        }
      },
      {
        type: 'number',
        id: 'number_always_visible',
        label: 'Number Field',
        defaultValue: 42
      }
    ]

    const defaults = extractCustomFieldDefaults(fields)

    // Should include fields without visibility conditions
    expect(defaults.text_always_visible).toBe('default_text')
    expect(defaults.number_always_visible).toBe(42)

    // Should NOT include field with visibility conditions (let FormField handle it)
    expect(defaults.hidden_with_conditions).toBeUndefined()
  })

  it('integration: custom fields with visibility conditions in FormRenderer', async () => {
    // Simulate the real donation form scenario
    const customFields: CustomFieldDefinition[] = [
      {
        type: 'text',
        id: 'text_company',
        label: 'Company Name',
        defaultValue: '',
        optional: true
      },
      {
        type: 'hidden',
        id: 'hidden_is_large_donor',
        label: 'is_large_donor',
        defaultValue: 'yes',
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            conditions: [
              {
                field: 'donationAmount',
                operator: 'greaterOrEqual',
                value: 50
              }
            ],
            match: 'all'
          }
        }
      }
    ]

    // Extract defaults (should skip hidden field with conditions)
    const defaults = extractCustomFieldDefaults(customFields)
    expect(defaults.hidden_is_large_donor).toBeUndefined()

    // Create the form
    const customFieldsForm = useCustomFieldsForm(customFields)
    const form = defineForm('testForm', () => ({
      donationAmount: numberField('donationAmount', {
        label: 'Amount',
        defaultValue: 10 // Start below threshold
      }),
      ...customFieldsForm.setup({
        values: computed(() => ({})),
        form: computed(() => ({}))
      } as FormContext)
    }))

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: form,
        modelValue: { ...defaults, donationAmount: 10 }
      }
    })

    await wrapper.vm.$nextTick()

    // Get initial form data
    const initialData = wrapper.emitted('update:modelValue')?.[0]?.[0] as Record<string, unknown>

    // Hidden field should NOT be present since donationAmount (10) < 50
    expect(initialData.hidden_is_large_donor).toBeUndefined()
    expect(initialData.donationAmount).toBe(10)
  })
})
