import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Create product selector config section definition
 * Returns the form configuration for editing product selector feature settings
 */
export function createProductSelectorConfigSection(): ConfigSectionDef {
  return {
    id: 'productSelector',
    title: 'Product Selector',
    description: 'Configure the product selection interface and terminology',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Product Selector',
        description: 'Show product selector interface to donors',
        classLabel: 'font-bold'
      },
      config: {
        type: 'field-group',
        label: 'Selector Configuration',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        class: 'space-y-3',
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
            class: 'grid grid-cols-2 gap-4',
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
            class: 'grid grid-cols-2 gap-4',
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
