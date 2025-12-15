import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Create multiple products config section definition
 * Returns the form configuration for editing multiple products feature settings
 */
export function createMultipleProductsConfigSection(): ConfigSectionDef {
  return {
    id: 'multipleProducts',
    title: 'Multiple Products',
    description: 'Configure support for adding multiple products to cart',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Multiple Products',
        description: 'Allow donors to add multiple products to their cart',
        classLabel: 'font-bold'
      },
      settings: {
        type: 'field-group',
        label: 'Display Settings',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        class: 'space-y-3',
        fields: {
          initialDisplay: {
            type: 'number',
            label: 'Initial Products Displayed',
            description: 'Number of products shown initially before "Show More"',
            placeholder: '3',
            min: 1,
            max: 20,
            rules: z.number().min(1, 'Must be at least 1').max(20, 'Cannot exceed 20')
          }
        }
      }
    }
  }
}
