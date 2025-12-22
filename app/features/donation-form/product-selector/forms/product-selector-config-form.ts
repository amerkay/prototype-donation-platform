import * as z from 'zod'
import type { FormDef } from '~/features/form-builder/form-builder-types'

/**
 * Create product selector config section definition
 * Returns the form configuration for editing product selector feature settings
 */
export function createProductSelectorConfigSection(): FormDef {
  return {
    id: 'productSelector',
    // title: 'Product Selector',
    // description: 'Configure the product selection interface and terminology',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Product Selector',
        description: 'Show product selector interface to donors',
        labelClass: 'font-bold'
      },
      productList: {
        type: 'field-group',
        label: 'Products Available',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        badgeLabel: 'On my TODO list',
        badgeVariant: 'secondary',
        isDisabled: true
      },
      config: {
        type: 'field-group',
        label: 'Selector Configuration',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,

        fields: {
          icon: {
            type: 'emoji',
            label: 'Selector Icon',
            placeholder: '🎯',
            rules: z.string().min(1, 'Required').max(2, 'Must be a single emoji')
          },
          entity: {
            type: 'field-group',
            // label: 'Entity Labels',
            class: 'grid grid-cols-2 gap-x-3',
            fields: {
              singular: {
                type: 'text',
                label: 'Singular Form',
                placeholder: 'project',
                rules: z.string().min(1, 'Required')
              },
              plural: {
                type: 'text',
                label: 'Plural Form',
                placeholder: 'projects',
                rules: z.string().min(1, 'Required')
              }
            }
          },
          action: {
            type: 'field-group',
            // label: 'Action Labels',
            class: 'grid grid-cols-2 gap-x-3',
            fields: {
              verb: {
                type: 'text',
                label: 'Action Verb',
                placeholder: 'support',
                rules: z.string().min(1, 'Required')
              },
              noun: {
                type: 'text',
                label: 'Action Noun',
                placeholder: 'project',
                rules: z.string().min(1, 'Required')
              }
            }
          }
        }
      }
    }
  }
}
