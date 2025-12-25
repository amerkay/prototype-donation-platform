import * as z from 'zod'
import type { FormDef } from '~/features/form-builder/types'

/**
 * Create multiple products config section definition
 * Returns the form configuration for editing multiple products feature settings
 */
export function createMultipleProductsConfigSection(): FormDef {
  return {
    id: 'impactCart',
    // title: 'Multiple Products',
    // description: 'Configure support for adding multiple products to cart',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Multiple Products',
        description: 'Allow donors to add multiple products to their cart',
        labelClass: 'font-bold'
      },
      productList: {
        type: 'field-group',
        label: 'Products Available',
        description: 'Define the products that donors can add to their cart',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        badgeLabel: 'On my TODO list',
        badgeVariant: 'secondary',
        isDisabled: true
      },
      settings: {
        type: 'field-group',
        label: 'Display Settings',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,

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
