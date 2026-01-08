import type { FormDef } from '~/features/form-builder/types'
import type { ContextSchema } from '~/features/form-builder/conditions'
import { createCustomFieldsConfigSection } from '~/features/custom-fields/forms/custom-fields-config-form'

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
 * Splits configuration into Step 2 and Step 3 tabs
 * Each step has its own enabled toggle and fields array
 *
 * @param contextSchema - Optional external context schema for condition builder
 */
export function createDonationCustomFieldsConfigSection(contextSchema?: ContextSchema): FormDef {
  // Get the base custom fields config (we'll reuse the fields structure)
  const baseConfig = createCustomFieldsConfigSection(contextSchema)
  const fieldsArrayConfig = baseConfig.fields.fields // The array field config

  // Extract fields array config with proper type
  if (!fieldsArrayConfig || fieldsArrayConfig.type !== 'array') {
    throw new Error('Expected fields to be an array field')
  }

  // Filter context schema for each step
  const step2Schema = contextSchema ? filterContextSchemaByStep(contextSchema, 2) : undefined
  const step3Schema = contextSchema ? filterContextSchemaByStep(contextSchema, 3) : undefined

  // Create step 2 config with filtered schema
  const step2Config = createCustomFieldsConfigSection(step2Schema)
  const step2FieldsArrayConfig = step2Config.fields.fields
  if (!step2FieldsArrayConfig || step2FieldsArrayConfig.type !== 'array') {
    throw new Error('Expected step2 fields to be an array field')
  }

  // Create step 3 config with filtered schema
  const step3Config = createCustomFieldsConfigSection(step3Schema)
  const step3FieldsArrayConfig = step3Config.fields.fields
  if (!step3FieldsArrayConfig || step3FieldsArrayConfig.type !== 'array') {
    throw new Error('Expected step3 fields to be an array field')
  }

  return {
    id: 'customFields',
    fields: {
      customFieldsTabs: {
        type: 'tabs',
        label: 'Custom Fields Configuration',
        description: 'Add extra questions to different steps of the donation form',
        tabs: [
          {
            value: 'step2',
            label: 'Step 2 Custom Fields',
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Enable Step 2 Custom Fields',
                description: 'Add extra questions to Step 2 (after donor info, before payment)',
                labelClass: 'font-bold',
                isSeparatorAfter: true
              },
              fields: step2FieldsArrayConfig
            }
          },
          {
            value: 'step3',
            label: 'Step 3 Custom Fields',
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Enable Step 3 Custom Fields',
                description:
                  'Add extra questions to Step 3 (with Gift Aid, cover costs, and preferences)',
                labelClass: 'font-bold',
                isSeparatorAfter: true
              },
              fields: step3FieldsArrayConfig
            }
          }
        ]
      }
    }
  }
}
