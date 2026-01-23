import { defineForm, toggleField, tabsField } from '~/features/_library/form-builder/api'
import type { ComposableForm, FormContext } from '~/features/_library/form-builder/types'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import { useCustomFieldsConfigForm } from '~/features/_library/custom-fields/forms/custom-fields-config-form'
import { extractAvailableFields } from '~/features/_library/custom-fields/forms/field-extraction'
import { computed } from 'vue'

/**
 * Filter context schema to only include fields available at or before the given step
 * @param schema - Full context schema
 * @param stepNumber - Current step number (e.g., 2, 3)
 * @returns Filtered schema with only relevant fields
 */
function filterContextSchemaByStep(schema: ContextSchema, stepNumber: number): ContextSchema {
  const filtered: ContextSchema = {}

  for (const [key, value] of Object.entries(schema)) {
    // Include field if:
    // 1. It has no availableFromStep metadata (always available)
    // 2. Its availableFromStep is at or before the current step
    if (!value.availableFromStep || value.availableFromStep <= stepNumber) {
      filtered[key] = value
    }
  }

  return filtered
}

/**
 * Create tabbed custom fields config section for donation form
 * Splits configuration into Step 2, Step 3, and Hidden Fields tabs
 * Each step has its own enabled toggle and fields array
 * Hidden fields are stored but not rendered on any step
 *
 * @param contextSchema - Optional external context schema for condition builder
 */
export function createDonationCustomFieldsConfigSection(
  contextSchema?: ContextSchema
): ComposableForm {
  // Filter context schema for each step
  const step2Schema = contextSchema ? filterContextSchemaByStep(contextSchema, 2) : undefined
  const step3Schema = contextSchema ? filterContextSchemaByStep(contextSchema, 3) : undefined

  // Define allowed field types for each tab
  const visibleFieldTypes: import('~/features/_library/custom-fields/fields').CustomFieldType[] = [
    'text',
    'textarea',
    'number',
    'slider',
    'select',
    'checkbox',
    'radio-group'
  ]
  const hiddenFieldTypes: import('~/features/_library/custom-fields/fields').CustomFieldType[] = [
    'hidden'
  ]

  // Mock form context for setup calls
  const mockFormContext: FormContext = {
    values: computed(() => ({})),
    form: computed(() => ({}))
  }

  // Create step 2 config with filtered schema (no hidden fields)
  const step2Config = useCustomFieldsConfigForm(step2Schema, undefined, visibleFieldTypes)
  const step2Fields = step2Config.setup(mockFormContext)
  const step2FieldsArrayConfig = step2Fields.fields
  if (!step2FieldsArrayConfig || step2FieldsArrayConfig.type !== 'array') {
    throw new Error('Expected step2 fields to be an array field')
  }

  // Create step 3 config with filtered schema and step 2 fields resolver (no hidden fields)
  const step3Config = useCustomFieldsConfigForm(
    step3Schema,
    (rootValues: Record<string, unknown>) => {
      // Extract fields from Step 2 configuration
      // Try multiple potential paths to handle nesting
      const customFieldsTabs =
        (rootValues.customFieldsTabs as Record<string, unknown>) ||
        ((rootValues.customFields as Record<string, unknown>)?.customFieldsTabs as Record<
          string,
          unknown
        >)

      const step2Data = customFieldsTabs?.step2 as Record<string, unknown> | undefined
      const step2Fields = step2Data?.fields

      if (Array.isArray(step2Fields)) {
        return extractAvailableFields(step2Fields as Record<string, unknown>[])
      }
      return []
    },
    visibleFieldTypes
  )
  const step3Fields = step3Config.setup(mockFormContext)
  const step3FieldsArrayConfig = step3Fields.fields
  if (!step3FieldsArrayConfig || step3FieldsArrayConfig.type !== 'array') {
    throw new Error('Expected step3 fields to be an array field')
  }

  // Create hidden fields config with full context and access to step2+step3 fields
  // Hidden fields CAN have visibility conditions to control when they're included in submission
  const hiddenConfig = useCustomFieldsConfigForm(
    contextSchema, // Use full context schema (not filtered by step)
    (rootValues: Record<string, unknown>) => {
      // Extract fields from BOTH Step 2 and Step 3 configurations
      const customFieldsTabs =
        (rootValues.customFieldsTabs as Record<string, unknown>) ||
        ((rootValues.customFields as Record<string, unknown>)?.customFieldsTabs as Record<
          string,
          unknown
        >)

      const fieldsFromBothSteps = []

      // Extract Step 2 fields
      const step2Data = customFieldsTabs?.step2 as Record<string, unknown> | undefined
      const step2Fields = step2Data?.fields
      if (Array.isArray(step2Fields)) {
        fieldsFromBothSteps.push(
          ...extractAvailableFields(step2Fields as Record<string, unknown>[])
        )
      }

      // Extract Step 3 fields
      const step3Data = customFieldsTabs?.step3 as Record<string, unknown> | undefined
      const step3Fields = step3Data?.fields
      if (Array.isArray(step3Fields)) {
        fieldsFromBothSteps.push(
          ...extractAvailableFields(step3Fields as Record<string, unknown>[])
        )
      }

      return fieldsFromBothSteps
    },
    hiddenFieldTypes
  )
  const hiddenFields = hiddenConfig.setup(mockFormContext)
  const hiddenFieldsArrayConfig = hiddenFields.fields
  if (!hiddenFieldsArrayConfig || hiddenFieldsArrayConfig.type !== 'array') {
    throw new Error('Expected hidden fields to be an array field')
  }

  return defineForm('customFields', () => {
    const step2Enabled = toggleField('enabled', {
      label: 'Enable Step 2 Custom Fields',
      description: 'Add extra questions to Step 2 (after donor info, before payment)',
      labelClass: 'font-bold',
      isSeparatorAfter: true
    })

    const step3Enabled = toggleField('enabled', {
      label: 'Enable Step 3 Custom Fields',
      description: 'Add extra questions to Step 3 (with Gift Aid, cover costs, and preferences)',
      labelClass: 'font-bold',
      isSeparatorAfter: true
    })

    const hiddenEnabled = toggleField('enabled', {
      label: 'Enable Hidden Fields',
      description: 'Add hidden tracking fields (stored but not shown to users on any step)',
      labelClass: 'font-bold',
      isSeparatorAfter: true
    })

    const customFieldsTabs = tabsField('customFieldsTabs', {
      label: 'Custom Fields Configuration',
      description: 'Add extra questions to different steps of the donation form',
      tabs: [
        {
          value: 'step2',
          label: 'Step 2 Custom Fields',
          fields: { enabled: step2Enabled, fields: step2FieldsArrayConfig }
        },
        {
          value: 'step3',
          label: 'Step 3 Custom Fields',
          fields: { enabled: step3Enabled, fields: step3FieldsArrayConfig }
        },
        {
          value: 'hidden',
          label: 'Hidden Fields',
          fields: { enabled: hiddenEnabled, fields: hiddenFieldsArrayConfig }
        }
      ]
    })

    return { customFieldsTabs }
  })
}
