import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Create multiple products config section definition
 * Returns the form configuration for editing multiple products feature settings
 */
export function createMultipleProductsConfigSection(): ConfigSectionDef {
  return {
    id: 'impactCart',
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
            type: 'select',
            label: 'Initial Products Displayed',
            description: 'Number of products shown initially before "Show More"',
            options: [
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' }
            ] as const,
            rules: z.number().min(2).max(5)
          }
        }
      }
    }
  }
}
