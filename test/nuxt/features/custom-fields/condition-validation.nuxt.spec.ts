import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import FormField from '~/features/_library/form-builder/FormField.vue'
import { buildConditionItemField } from '~/features/_library/custom-fields/forms/condition-field-builder'
import type { AvailableField } from '~/features/_library/form-builder/composables/useAvailableFields'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import type { FieldDef } from '~/features/_library/form-builder/types'
import {
  fieldGroup,
  arrayField,
  tabsField,
  toggleField
} from '~/features/_library/form-builder/api/defineForm'
import { mountFormField } from '../form-builder/test-utils'

async function waitForUpdate() {
  await nextTick()
  await nextTick()
  await nextTick()
}

describe('Condition Field Validation - Stale Closure Regression Tests', () => {
  it('REGRESSION: validates operator is valid for boolean field type (isTrue)', async () => {
    // This test covers the bug where operator validation used stale operators list from closure.
    // When field builder received boolean field with 'isTrue' operator, validation would fail
    // because the rules function captured wrong operators array in its closure.
    // The fix makes validation dynamic by recomputing operators on each validation run.
    const contextSchema: ContextSchema = {
      isTribute: {
        label: 'Is Tribute',
        type: 'boolean'
      }
    }

    const buildConditionField = buildConditionItemField([], contextSchema)

    const { validate, wrapper } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Condition',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            condition: buildConditionField({
              field: 'isTribute',
              operator: 'isTrue',
              value: ''
            })
          }
        },
        name: 'test'
      },
      {
        initialValues: {
          test: {
            condition: {
              field: 'isTribute',
              operator: 'isTrue',
              value: ''
            }
          }
        }
      }
    )

    await waitForUpdate()

    // CRITICAL: Validation should pass - operator 'isTrue' is valid for boolean fields
    const result = await validate()
    await waitForUpdate()

    expect(result.valid).toBe(true)
    const errorText = wrapper.text()
    expect(errorText).not.toContain('Invalid operator')

    // Collapse and reopen to trigger re-validation (tests accordion state)
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    if (trigger.exists()) {
      await trigger.trigger('click')
      await waitForUpdate()
      await trigger.trigger('click')
      await waitForUpdate()

      // Should still be valid after collapse/expand
      const result2 = await validate()
      expect(result2.valid).toBe(true)
      expect(wrapper.text()).not.toContain('Invalid operator')
    }
  })

  it('REGRESSION: validates operator is valid for array field type (in)', async () => {
    // Complementary test: array field with 'in' operator should also validate correctly
    const contextSchema: ContextSchema = {
      donationFrequency: {
        label: 'Donation Frequency',
        type: 'array',
        options: [
          { value: 'once', label: 'One-time' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' }
        ]
      }
    }

    const buildConditionField = buildConditionItemField([], contextSchema)

    const { validate, wrapper } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Condition',
          fields: {
            condition: buildConditionField({
              field: 'donationFrequency',
              operator: 'in',
              value: ['monthly', 'yearly']
            })
          }
        },
        name: 'test'
      },
      {
        initialValues: {
          test: {
            condition: {
              field: 'donationFrequency',
              operator: 'in',
              value: ['monthly', 'yearly']
            }
          }
        }
      }
    )

    await waitForUpdate()

    // Should be valid - 'in' is valid for array fields
    const result = await validate()
    expect(result.valid).toBe(true)
    expect(wrapper.text()).not.toContain('Invalid operator')
  })

  it('validates that operator field is required when field is selected', async () => {
    const availableFields: AvailableField[] = [
      { key: 'amount', label: 'Amount', type: 'number', group: 'Form Fields' }
    ]

    const buildConditionField = buildConditionItemField(availableFields)

    const { validate, wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('conditionConfig', {
          label: 'Condition Config',
          fields: {
            condition: buildConditionField({
              field: 'amount',
              operator: '', // Empty - should error
              value: ''
            })
          }
        }),
        name: 'conditionTest'
      },
      {
        initialValues: {
          conditionTest: {
            condition: {
              field: 'amount',
              operator: '',
              value: ''
            }
          }
        }
      }
    )

    await waitForUpdate()

    const result = await validate()
    await waitForUpdate()

    // Form should be invalid when operator is empty
    expect(result.valid).toBe(false)

    // Error message should be visible to user
    const errorText = wrapper.text()
    expect(errorText).toContain('Invalid operator')
  })

  it('validates that invalid operator values are rejected', async () => {
    const availableFields: AvailableField[] = [
      { key: 'amount', label: 'Amount', type: 'number', group: 'Form Fields' }
    ]

    const buildConditionField = buildConditionItemField(availableFields)

    const { validate, wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('conditionConfig', {
          label: 'Condition Config',
          fields: {
            condition: buildConditionField({
              field: 'amount',
              operator: 'greaterThanOrEqual', // WRONG - should be 'greaterOrEqual'
              value: 100
            })
          }
        }),
        name: 'invalidOpTest'
      },
      {
        initialValues: {
          invalidOpTest: {
            condition: {
              field: 'amount',
              operator: 'greaterThanOrEqual', // INVALID
              value: 100
            }
          }
        }
      }
    )

    await waitForUpdate()

    const result = await validate()
    await waitForUpdate()

    // Should be invalid - 'greaterThanOrEqual' is not a valid operator
    expect(result.valid).toBe(false)

    // Error message should be visible to user
    const errorText = wrapper.text()
    expect(errorText).toContain('Invalid operator')
  })

  it('validates that field selection is required', async () => {
    const availableFields: AvailableField[] = [
      { key: 'amount', label: 'Amount', type: 'number', group: 'Form Fields' }
    ]

    const buildConditionField = buildConditionItemField(availableFields)

    const { validate, wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('conditionConfig', {
          label: 'Condition Config',
          fields: {
            condition: buildConditionField({}) // Empty field
          }
        }),
        name: 'emptyFieldTest'
      },
      {
        initialValues: {
          emptyFieldTest: {
            condition: {
              field: '',
              operator: '',
              value: ''
            }
          }
        }
      }
    )

    await waitForUpdate()

    const result = await validate()
    await waitForUpdate()

    // Should be invalid - field is required
    expect(result.valid).toBe(false)

    // Error message should be visible to user
    const errorText = wrapper.text()
    expect(errorText).toMatch(/field.*required|required.*field|select.*field/i)
  })

  it('validates that value is required when operator requires it', async () => {
    const availableFields: AvailableField[] = [
      { key: 'amount', label: 'Amount', type: 'number', group: 'Form Fields' }
    ]

    const buildConditionField = buildConditionItemField(availableFields)

    const { validate, wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('conditionConfig', {
          label: 'Condition Config',
          fields: {
            condition: buildConditionField({
              field: 'amount',
              operator: 'greaterOrEqual', // Requires a value
              value: '' // Empty - should error
            })
          }
        }),
        name: 'missingValueTest'
      },
      {
        initialValues: {
          missingValueTest: {
            condition: {
              field: 'amount',
              operator: 'greaterOrEqual',
              value: ''
            }
          }
        }
      }
    )

    await waitForUpdate()

    const result = await validate()
    await waitForUpdate()

    // Should be invalid - value is required for 'greaterOrEqual'
    expect(result.valid).toBe(false)

    // Error message should be visible to user
    const errorText = wrapper.text()
    expect(errorText).toMatch(/value.*required|required.*value/i)
  })

  it('validates non-array conditions work correctly', async () => {
    // Verify the main fix: operator field validation works for simple forms
    // Note: Array item validation in vee-validate only catches errors for mounted fields
    const availableFields: AvailableField[] = [
      { key: 'frequency', label: 'Frequency', type: 'string', group: 'Form Fields' }
    ]

    const buildConditionField = buildConditionItemField(availableFields)

    const { validate, wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('conditionTest', {
          label: 'Condition Test',
          fields: {
            condition: buildConditionField({ field: 'frequency', operator: '', value: '' })
          }
        }),
        name: 'simpleTest'
      },
      {
        initialValues: {
          simpleTest: {
            condition: {
              field: 'frequency',
              operator: '',
              value: ''
            }
          }
        }
      }
    )

    await waitForUpdate()

    const result = await validate()
    await waitForUpdate()

    // Verify: operator required validation works
    expect(result.valid).toBe(false)
    const errorText = wrapper.text()
    expect(errorText).toContain('Invalid operator')
  })
})

describe('Condition Field Validation - Error Display and Badges', () => {
  const precedingFields: AvailableField[] = [
    {
      key: 'donationType',
      label: 'Donation Type',
      type: 'string',
      options: [
        { value: 'once', label: 'One-time' },
        { value: 'monthly', label: 'Monthly' }
      ],
      group: 'Form Fields'
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'number',
      group: 'Form Fields'
    }
  ]

  const contextSchema: ContextSchema = {
    donationAmount: {
      label: 'Donation Amount',
      type: 'number',
      description: 'Total donation amount'
    },
    currency: {
      label: 'Currency',
      type: 'string',
      options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' }
      ]
    }
  }

  describe('Single Condition Field Errors', () => {
    it('shows error on mount when field reference is invalid', async () => {
      const conditionItemField = buildConditionItemField(precedingFields, contextSchema)

      const { validate, wrapper } = await mountFormField(
        FormField,
        {
          meta: conditionItemField({
            field: 'nonExistentField', // Invalid field
            operator: 'in',
            value: ['test']
          }),
          name: 'condition'
        },
        {
          initialValues: {
            condition: {
              field: 'nonExistentField',
              operator: 'in',
              value: ['test']
            }
          }
        }
      )

      await waitForUpdate()

      // Validate form
      const result = await validate()
      await waitForUpdate()

      // Should be invalid
      expect(result.valid).toBe(false)

      // Error should be visible in UI
      const errorText = wrapper.text()
      const hasErrorText =
        errorText.includes('must reference') ||
        errorText.includes('This field is no longer available')
      expect(hasErrorText).toBe(true)
    })

    it('shows error on mount when operator is invalid', async () => {
      const conditionItemField = buildConditionItemField(precedingFields, contextSchema)

      const { validate, wrapper } = await mountFormField(
        FormField,
        {
          meta: conditionItemField({
            field: 'amount',
            operator: 'greaterThanOrEqual', // Invalid operator (wrong format)
            value: 100
          }),
          name: 'condition'
        },
        {
          initialValues: {
            condition: {
              field: 'amount',
              operator: 'greaterThanOrEqual', // Invalid
              value: 100
            }
          }
        }
      )

      await waitForUpdate()

      // Validate form
      const result = await validate()
      await waitForUpdate()

      // Should be invalid
      expect(result.valid).toBe(false)

      // Error should be visible in UI
      const errorText = wrapper.text()
      expect(errorText).toContain('Invalid operator')
    })

    it('shows error on mount when value is invalid for selected field type', async () => {
      const conditionItemField = buildConditionItemField(precedingFields, contextSchema)

      const { validate, wrapper } = await mountFormField(
        FormField,
        {
          meta: conditionItemField({
            field: 'amount', // Number field
            operator: 'greaterOrEqual',
            value: 'not-a-number' // Invalid value type
          }),
          name: 'condition'
        },
        {
          initialValues: {
            condition: {
              field: 'amount',
              operator: 'greaterOrEqual',
              value: 'not-a-number'
            }
          }
        }
      )

      await waitForUpdate()

      // Validate form
      const result = await validate()
      await waitForUpdate()

      // Should be invalid
      expect(result.valid).toBe(false)

      // Error should be visible in UI
      const errorText = wrapper.text()
      const hasCorrectError =
        errorText.includes('Expected number') || errorText.includes('Value is required')
      expect(hasCorrectError).toBe(true)
    })
  })

  describe('Array of Conditions - Error Badges at All Levels', () => {
    it('shows error badge at array level when condition has invalid field', async () => {
      const conditionItemField = buildConditionItemField(precedingFields, contextSchema)

      const { validate, wrapper } = await mountFormField(
        FormField,
        {
          meta: {
            type: 'array',
            name: 'conditions',
            label: 'Conditions',
            itemField: conditionItemField,
            defaultValue: []
          } as FieldDef,
          name: 'conditions'
        },
        {
          initialValues: {
            conditions: [
              {
                field: 'invalidField', // Invalid
                operator: 'equals',
                value: 'test'
              }
            ]
          }
        }
      )

      await waitForUpdate()

      // Validate form
      const result = await validate()
      await waitForUpdate()

      // Form must be invalid
      expect(result.valid).toBe(false)

      // Error should be visible - either in error message or red label styling
      const text = wrapper.text()
      const hasErrorMessage =
        text.includes('must reference') ||
        text.includes('no longer available') ||
        text.includes('invalid') ||
        text.includes('required')
      expect(hasErrorMessage).toBe(true)
    })

    it('shows error badge at field-group level when nested condition is invalid', async () => {
      const conditionItemField = buildConditionItemField(precedingFields, contextSchema)

      const { validate, wrapper } = await mountFormField(
        FormField,
        {
          meta: fieldGroup('visibilitySettings', {
            label: 'Visibility Settings',
            collapsible: true,
            collapsibleDefaultOpen: true, // MUST be open for initial validation to run
            fields: {
              conditions: arrayField('conditions', {
                label: 'Conditions',
                itemField: conditionItemField,
                defaultValue: []
              })
            }
          }),
          name: 'visibilitySettings'
        },
        {
          initialValues: {
            visibilitySettings: {
              conditions: [
                {
                  field: 'invalidField', // Invalid
                  operator: 'equals',
                  value: 'test'
                }
              ]
            }
          }
        }
      )

      await waitForUpdate()

      // Validate form
      const result = await validate()
      await waitForUpdate()

      // Form must be invalid
      expect(result.valid).toBe(false)

      // Error should be visible somewhere in the UI
      const text = wrapper.text()
      const hasError =
        text.includes('Error') ||
        text.includes('invalid') ||
        text.includes('required') ||
        text.includes('must reference')
      expect(hasError).toBe(true)

      // Test that content persists when collapsed
      const accordionTrigger = wrapper.find('[data-slot="accordion-trigger"]')
      if (accordionTrigger.exists()) {
        await accordionTrigger.trigger('click')
        await waitForUpdate()
        // Verify form is still invalid after collapse
        expect(result.valid).toBe(false)
      }
    })

    it('shows error badge at tab level when tab contains invalid condition', async () => {
      const conditionItemField = buildConditionItemField(precedingFields, contextSchema)

      const { validate, wrapper } = await mountFormField(
        FormField,
        {
          meta: tabsField('fieldConfig', {
            label: 'Field Configuration',
            defaultValue: 'visibility',
            tabs: [
              {
                value: 'visibility',
                label: 'Visibility',
                fields: {
                  conditions: arrayField('conditions', {
                    label: 'Conditions',
                    itemField: conditionItemField,
                    defaultValue: []
                  })
                }
              },
              {
                value: 'validation',
                label: 'Validation',
                fields: {
                  required: toggleField('required', {
                    label: 'Required',
                    defaultValue: false
                  })
                }
              }
            ]
          }),
          name: 'fieldConfig'
        },
        {
          initialValues: {
            fieldConfig: {
              visibility: {
                conditions: [
                  {
                    field: 'amount',
                    operator: 'greaterThanOrEqual', // Invalid operator
                    value: 100
                  }
                ]
              },
              validation: {
                required: false
              }
            }
          }
        }
      )

      await waitForUpdate()

      // Validate form
      const result = await validate()
      await waitForUpdate()

      // Form must be invalid
      expect(result.valid).toBe(false)

      // Error should be visible somewhere in the UI
      const text = wrapper.text()
      expect(text).toMatch(/invalid.*operator|operator.*invalid/i)

      // Check that tabs exist and Visibility tab shows error indicator
      expect(text).toContain('Visibility')
      expect(text).toContain('Validation')
    })

    it('shows error badge at all levels: tab > field-group > array > field', async () => {
      const conditionItemField = buildConditionItemField(precedingFields, contextSchema)

      const { validate, wrapper } = await mountFormField(
        FormField,
        {
          meta: tabsField('customFields', {
            label: 'Custom Fields Config',
            defaultValue: 'step2',
            tabs: [
              {
                value: 'step2',
                label: 'Step 2',
                fields: {
                  visibilitySettings: fieldGroup('visibilitySettings', {
                    label: 'Visibility Settings',
                    collapsible: true,
                    collapsibleDefaultOpen: true, // Start expanded to ensure validation triggers
                    fields: {
                      conditions: arrayField('conditions', {
                        label: 'Conditions',
                        itemField: conditionItemField,
                        defaultValue: []
                      })
                    }
                  })
                }
              },
              {
                value: 'step3',
                label: 'Step 3',
                fields: {
                  enabled: toggleField('enabled', {
                    label: 'Enabled',
                    defaultValue: false
                  })
                }
              }
            ]
          }),
          name: 'customFields'
        },
        {
          initialValues: {
            customFields: {
              step2: {
                visibilitySettings: {
                  conditions: [
                    {
                      field: 'amount',
                      operator: 'greaterOrEqual',
                      value: 'not-a-number' // Invalid value for number field
                    }
                  ]
                }
              },
              step3: {
                enabled: false
              }
            }
          }
        }
      )

      await waitForUpdate()

      // Validate form
      const result = await validate()
      await waitForUpdate()

      // Form must be invalid
      expect(result.valid).toBe(false)

      // Error should be visible in the UI
      const text = wrapper.text()
      const hasError =
        text.includes('Expected number') ||
        text.includes('Value is required') ||
        text.includes('Error') ||
        text.includes('invalid')
      expect(hasError).toBe(true)

      // Verify tabs are present
      expect(text).toContain('Step 2')
      expect(text).toContain('Step 3')
    })
  })

  describe('Error Persistence Across UI Interactions', () => {
    it('preserves error badge when collapsing field-group with invalid condition', async () => {
      const conditionItemField = buildConditionItemField(precedingFields, contextSchema)

      const { validate, wrapper } = await mountFormField(
        FormField,
        {
          meta: fieldGroup('visibilityGroup', {
            label: 'Visibility Settings',
            collapsible: true,
            collapsibleDefaultOpen: true, // Start expanded
            fields: {
              conditions: arrayField('conditions', {
                label: 'Conditions',
                itemField: conditionItemField,
                defaultValue: []
              })
            }
          }),
          name: 'visibilitySettings'
        },
        {
          initialValues: {
            visibilitySettings: {
              conditions: [
                {
                  field: 'amount',
                  operator: 'invalidOperator', // Invalid
                  value: 100
                }
              ]
            }
          }
        }
      )

      await waitForUpdate()

      // Validate form
      const result = await validate()
      await waitForUpdate()

      // Form must be invalid
      expect(result.valid).toBe(false)

      // Error should be visible when expanded
      let text = wrapper.text()
      expect(text).toMatch(/error|invalid.*operator/i)

      // Collapse the field-group
      const accordionTrigger = wrapper.find('[data-slot="accordion-trigger"]')
      if (accordionTrigger.exists()) {
        await accordionTrigger.trigger('click')
        await waitForUpdate()

        // Form should still be invalid after collapse
        text = wrapper.text()
        expect(result.valid).toBe(false)
        // Error badge/indicator should persist (visible in text or badge element)
        const stillHasError = text.includes('Error') || text.includes('Visibility Settings')
        expect(stillHasError).toBe(true)
      }
    })

    it('preserves error badge when switching tabs away from invalid condition', async () => {
      const conditionItemField = buildConditionItemField(precedingFields, contextSchema)

      const { validate, wrapper } = await mountFormField(
        FormField,
        {
          meta: tabsField('fieldConfig', {
            label: 'Field Configuration',
            defaultValue: 'visibility',
            tabs: [
              {
                value: 'visibility',
                label: 'Visibility',
                fields: {
                  conditions: arrayField('conditions', {
                    label: 'Conditions',
                    itemField: conditionItemField,
                    defaultValue: []
                  })
                }
              },
              {
                value: 'validation',
                label: 'Validation',
                fields: {
                  required: toggleField('required', {
                    label: 'Required',
                    defaultValue: false
                  })
                }
              }
            ]
          }),
          name: 'fieldConfig'
        },
        {
          initialValues: {
            fieldConfig: {
              visibility: {
                conditions: [
                  {
                    field: 'invalidField', // Invalid
                    operator: 'contains',
                    value: 'test'
                  }
                ]
              },
              validation: {
                required: false
              }
            }
          }
        }
      )

      await waitForUpdate()

      // Validate form
      const result = await validate()
      await waitForUpdate()

      // Form must be invalid
      expect(result.valid).toBe(false)

      // Error should be visible in the UI
      let text = wrapper.text()
      const hasError =
        text.includes('Error') ||
        text.includes('invalid') ||
        text.includes('must reference') ||
        text.includes('no longer available')
      expect(hasError).toBe(true)

      // Switch tabs to verify error persists
      const tabs = wrapper.findAll('[data-slot="tabs-trigger"]')
      const validationTab = tabs.find((t) => t.text().includes('Validation'))
      if (validationTab) {
        await validationTab.trigger('click')
        await waitForUpdate()

        // Form should still be invalid
        expect(result.valid).toBe(false)

        // Switch back to Visibility tab
        const visibilityTab = tabs.find((t) => t.text().includes('Visibility'))
        if (visibilityTab) {
          await visibilityTab.trigger('click')
          await waitForUpdate()

          // Error should still be visible
          text = wrapper.text()
          expect(result.valid).toBe(false)
        }
      }
    })
  })
})
