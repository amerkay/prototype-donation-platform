import type { FormDef } from '~/features/form-builder/types'
import type { ContextSchema } from '~/features/form-builder/conditions'
import { createCustomFieldsConfigSection } from '~/features/custom-fields/forms/custom-fields-config-form'

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
              fields: {
                ...fieldsArrayConfig,
                label: 'Step 2 Custom Fields',
                description: 'Additional questions shown in Step 2 of the donation form'
              }
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
              fields: {
                ...fieldsArrayConfig,
                label: 'Step 3 Custom Fields',
                description: 'Additional questions shown in Step 3 of the donation form'
              }
            }
          }
        ]
      }
    }
  }
}
