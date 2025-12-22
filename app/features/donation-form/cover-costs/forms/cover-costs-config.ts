import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Create cover costs config section definition
 * Returns the form configuration for editing cover costs settings
 */
export function createCoverCostsConfigSection(): ConfigSectionDef {
  return {
    id: 'coverCosts',
    // title: 'Cover Costs',
    // description: 'Configure cover costs feature displayed to donors',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Cover Costs Feature',
        description: 'Allow donors to optionally cover operational costs',
        labelClass: 'font-bold'
      },
      settings: {
        type: 'field-group',
        label: 'Cover Costs Settings',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,

        fields: {
          heading: {
            type: 'text',
            label: 'Heading',
            description: 'The heading shown above the cover costs option',
            placeholder: 'Send 100% to the [Your Cause]',
            rules: z.string().min(1, 'Heading is required when enabled')
          },
          description: {
            type: 'textarea',
            label: 'Description',
            description: 'The description text explaining cover costs benefit',
            placeholder:
              'By covering operational costs, your entire donation goes directly to [your cause].',
            rules: z.string().min(1, 'Description is required when enabled')
          },
          defaultPercentage: {
            type: 'slider',
            label: 'Default Percentage',
            description: 'The default percentage donors will see (0-30%)',
            placeholder: '10',
            min: 3,
            max: 30,
            suffix: '%',
            rules: z.number().min(0).max(30)
          }
        }
      }
    }
  }
}
