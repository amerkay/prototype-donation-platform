import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import FormField from '~/features/_library/form-builder/FormField.vue'
import { buildConditionItemField } from '~/features/_library/form-builder/conditions'
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

// ---------------------------------------------------------------------------
// Scenario factory — eliminates ~80% of boilerplate across tests
// ---------------------------------------------------------------------------

type ContainerType = 'bare' | 'fieldGroup' | 'tabs' | 'tabsNested'

async function mountConditionScenario(scenario: {
  field: string
  operator: string
  value: unknown
  availableFields?: AvailableField[]
  contextSchema?: ContextSchema
  container?: ContainerType
}) {
  const {
    field,
    operator,
    value,
    availableFields = [],
    contextSchema,
    container = 'bare'
  } = scenario

  const conditionItemField = buildConditionItemField(availableFields, contextSchema)
  const conditionData = { field, operator, value }

  type MountMeta = Parameters<typeof mountFormField>[1]['meta']

  let meta: MountMeta
  let initialValues: Record<string, unknown>
  let name: string

  switch (container) {
    case 'fieldGroup': {
      name = 'visibilitySettings'
      meta = fieldGroup('visibilitySettings', {
        label: 'Visibility Settings',
        collapsible: true,
        collapsibleDefaultOpen: true,
        fields: {
          conditions: arrayField('conditions', {
            label: 'Conditions',
            itemField: conditionItemField,
            defaultValue: []
          })
        }
      })
      initialValues = { [name]: { conditions: [conditionData] } }
      break
    }
    case 'tabs': {
      name = 'fieldConfig'
      meta = tabsField('fieldConfig', {
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
      })
      initialValues = {
        [name]: {
          visibility: { conditions: [conditionData] },
          validation: { required: false }
        }
      }
      break
    }
    case 'tabsNested': {
      name = 'customFields'
      meta = tabsField('customFields', {
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
                collapsibleDefaultOpen: true,
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
      })
      initialValues = {
        [name]: {
          step2: { visibilitySettings: { conditions: [conditionData] } },
          step3: { enabled: false }
        }
      }
      break
    }
    default: {
      // bare — single condition item field
      name = 'condition'
      meta = conditionItemField(conditionData)
      initialValues = { [name]: conditionData }
    }
  }

  const result = await mountFormField(FormField, { meta, name }, { initialValues })

  await waitForUpdate()
  return result
}

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Condition Field Validation - Stale Closure Regression Tests', () => {
  it('REGRESSION: validates operator is valid for boolean field type (isTrue)', async () => {
    const boolSchema: ContextSchema = {
      isTribute: { label: 'Is Tribute', type: 'boolean' }
    }

    const buildConditionField = buildConditionItemField([], boolSchema)

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
            condition: { field: 'isTribute', operator: 'isTrue', value: '' }
          }
        }
      }
    )

    await waitForUpdate()

    const result = await validate()
    await waitForUpdate()

    expect(result.valid).toBe(true)
    expect(wrapper.text()).not.toContain('Invalid operator')
  })

  it('REGRESSION: validation remains valid after collapse/expand cycle', async () => {
    const boolSchema: ContextSchema = {
      isTribute: { label: 'Is Tribute', type: 'boolean' }
    }

    const buildConditionField = buildConditionItemField([], boolSchema)

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
            condition: { field: 'isTribute', operator: 'isTrue', value: '' }
          }
        }
      }
    )

    await waitForUpdate()

    // Collapse and reopen
    const trigger = wrapper.find('button[aria-expanded]')
    if (trigger.exists()) {
      await trigger.trigger('click')
      await waitForUpdate()
      await trigger.trigger('click')
      await waitForUpdate()

      const result = await validate()
      expect(result.valid).toBe(true)
      expect(wrapper.text()).not.toContain('Invalid operator')
    }
  })

  it('REGRESSION: validates operator is valid for array field type (in)', async () => {
    const arraySchema: ContextSchema = {
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

    const buildConditionField = buildConditionItemField([], arraySchema)

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

    const result = await validate()
    expect(result.valid).toBe(true)
    expect(wrapper.text()).not.toContain('Invalid operator')
  })

  it('validates that operator field is required when field is selected', async () => {
    const { validate, wrapper } = await mountConditionScenario({
      field: 'amount',
      operator: '',
      value: '',
      availableFields: [{ key: 'amount', label: 'Amount', type: 'number', group: 'Form Fields' }]
    })

    const result = await validate()
    await waitForUpdate()

    expect(result.valid).toBe(false)
    expect(wrapper.text()).toContain('Invalid operator')
  })

  it('validates that invalid operator values are rejected', async () => {
    const { validate, wrapper } = await mountConditionScenario({
      field: 'amount',
      operator: 'greaterThanOrEqual', // WRONG — should be 'greaterOrEqual'
      value: 100,
      availableFields: [{ key: 'amount', label: 'Amount', type: 'number', group: 'Form Fields' }]
    })

    const result = await validate()
    await waitForUpdate()

    expect(result.valid).toBe(false)
    expect(wrapper.text()).toContain('Invalid operator')
  })

  it('validates that field selection is required', async () => {
    const { validate, wrapper } = await mountConditionScenario({
      field: '',
      operator: '',
      value: '',
      availableFields: [{ key: 'amount', label: 'Amount', type: 'number', group: 'Form Fields' }]
    })

    const result = await validate()
    await waitForUpdate()

    expect(result.valid).toBe(false)
    expect(wrapper.text()).toMatch(/field.*required|required.*field|select.*field/i)
  })

  it('validates that value is required when operator requires it', async () => {
    const { validate, wrapper } = await mountConditionScenario({
      field: 'amount',
      operator: 'greaterOrEqual',
      value: '',
      availableFields: [{ key: 'amount', label: 'Amount', type: 'number', group: 'Form Fields' }]
    })

    const result = await validate()
    await waitForUpdate()

    expect(result.valid).toBe(false)
    expect(wrapper.text()).toMatch(/value.*required|required.*value/i)
  })

  it('validates non-array conditions work correctly', async () => {
    const { validate, wrapper } = await mountConditionScenario({
      field: 'frequency',
      operator: '',
      value: '',
      availableFields: [
        { key: 'frequency', label: 'Frequency', type: 'string', group: 'Form Fields' }
      ]
    })

    const result = await validate()
    await waitForUpdate()

    expect(result.valid).toBe(false)
    expect(wrapper.text()).toContain('Invalid operator')
  })
})

describe('Condition Field Validation - Error Display and Badges', () => {
  describe('Single Condition Field Errors', () => {
    it('shows error on mount when field reference is invalid', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'nonExistentField',
        operator: 'in',
        value: ['test'],
        availableFields: precedingFields,
        contextSchema
      })

      const result = await validate()
      await waitForUpdate()

      expect(result.valid).toBe(false)
      expect(wrapper.text()).toContain('This field is no longer available')
    })

    it('shows error on mount when operator is invalid', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'amount',
        operator: 'greaterThanOrEqual',
        value: 100,
        availableFields: precedingFields,
        contextSchema
      })

      const result = await validate()
      await waitForUpdate()

      expect(result.valid).toBe(false)
      expect(wrapper.text()).toContain('Invalid operator')
    })

    it('shows error on mount when value is invalid for selected field type', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'amount',
        operator: 'greaterOrEqual',
        value: 'not-a-number',
        availableFields: precedingFields,
        contextSchema
      })

      const result = await validate()
      await waitForUpdate()

      expect(result.valid).toBe(false)
      const errorText = wrapper.text()
      expect(errorText.includes('Expected number') || errorText.includes('Value is required')).toBe(
        true
      )
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
            conditions: [{ field: 'invalidField', operator: 'equals', value: 'test' }]
          }
        }
      )

      await waitForUpdate()

      const result = await validate()
      await waitForUpdate()

      expect(result.valid).toBe(false)
      expect(wrapper.text()).toContain('no longer available')
    })

    it('shows error badge at field-group level when nested condition is invalid', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'invalidField',
        operator: 'equals',
        value: 'test',
        availableFields: precedingFields,
        contextSchema,
        container: 'fieldGroup'
      })

      const result = await validate()
      await waitForUpdate()

      expect(result.valid).toBe(false)
      expect(wrapper.text()).toContain('no longer available')
    })

    it('remains invalid after collapsing field-group with error', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'invalidField',
        operator: 'equals',
        value: 'test',
        availableFields: precedingFields,
        contextSchema,
        container: 'fieldGroup'
      })

      const result = await validate()
      await waitForUpdate()
      expect(result.valid).toBe(false)

      const accordionTrigger = wrapper.find('button[aria-expanded]')
      if (accordionTrigger.exists()) {
        await accordionTrigger.trigger('click')
        await waitForUpdate()
        expect(result.valid).toBe(false)
      }
    })

    it('shows error badge at tab level when tab contains invalid condition', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'amount',
        operator: 'greaterThanOrEqual',
        value: 100,
        availableFields: precedingFields,
        contextSchema,
        container: 'tabs'
      })

      const result = await validate()
      await waitForUpdate()

      expect(result.valid).toBe(false)
      expect(wrapper.text()).toMatch(/invalid.*operator|operator.*invalid/i)
      expect(wrapper.text()).toContain('Visibility')
      expect(wrapper.text()).toContain('Validation')
    })

    it('shows error badge at all levels: tab > field-group > array > field', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'amount',
        operator: 'greaterOrEqual',
        value: 'not-a-number',
        availableFields: precedingFields,
        contextSchema,
        container: 'tabsNested'
      })

      const result = await validate()
      await waitForUpdate()

      expect(result.valid).toBe(false)
      const text = wrapper.text()
      expect(text.includes('Expected number') || text.includes('Value is required')).toBe(true)
      expect(text).toContain('Step 2')
      expect(text).toContain('Step 3')
    })
  })

  describe('Error Persistence Across UI Interactions', () => {
    it('shows error when field-group with invalid condition is expanded', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'amount',
        operator: 'invalidOperator',
        value: 100,
        availableFields: precedingFields,
        contextSchema,
        container: 'fieldGroup'
      })

      const result = await validate()
      await waitForUpdate()

      expect(result.valid).toBe(false)
      expect(wrapper.text()).toMatch(/error|invalid.*operator/i)
    })

    it('preserves invalid state after collapsing field-group', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'amount',
        operator: 'invalidOperator',
        value: 100,
        availableFields: precedingFields,
        contextSchema,
        container: 'fieldGroup'
      })

      const result = await validate()
      await waitForUpdate()
      expect(result.valid).toBe(false)

      const accordionTrigger = wrapper.find('button[aria-expanded]')
      if (accordionTrigger.exists()) {
        await accordionTrigger.trigger('click')
        await waitForUpdate()
        expect(result.valid).toBe(false)
        expect(wrapper.text()).toContain('Visibility Settings')
      }
    })

    it('shows error when tabs contain invalid condition', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'invalidField',
        operator: 'contains',
        value: 'test',
        availableFields: precedingFields,
        contextSchema,
        container: 'tabs'
      })

      const result = await validate()
      await waitForUpdate()

      expect(result.valid).toBe(false)
      expect(wrapper.text()).toContain('no longer available')
    })

    it('preserves invalid state after switching tabs', async () => {
      const { validate, wrapper } = await mountConditionScenario({
        field: 'invalidField',
        operator: 'contains',
        value: 'test',
        availableFields: precedingFields,
        contextSchema,
        container: 'tabs'
      })

      const result = await validate()
      await waitForUpdate()
      expect(result.valid).toBe(false)

      const tabs = wrapper.findAll('[data-slot="tabs-trigger"]')
      const validationTab = tabs.find((t) => t.text().includes('Validation'))
      if (validationTab) {
        await validationTab.trigger('click')
        await waitForUpdate()
        expect(result.valid).toBe(false)

        const visibilityTab = tabs.find((t) => t.text().includes('Visibility'))
        if (visibilityTab) {
          await visibilityTab.trigger('click')
          await waitForUpdate()
          expect(result.valid).toBe(false)
        }
      }
    })
  })
})
