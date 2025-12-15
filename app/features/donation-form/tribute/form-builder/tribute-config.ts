import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Create tribute config section definition
 * Returns the form configuration for editing tribute settings in admin
 */
export function createTributeConfigSection(): ConfigSectionDef {
  return {
    id: 'tribute',
    title: 'Tribute Settings',
    description: 'Configure tribute, gift, and memorial donation options',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Tribute Feature',
        description: 'Allow donors to dedicate donations as gifts or memorials'
      },
      icons: {
        type: 'field-group',
        label: 'Icons',
        description: 'Emoji icons for different tribute types',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        fields: {
          gift: {
            type: 'emoji',
            label: 'Gift Icon',
            placeholder: '🎁',
            rules: z.string().min(1, 'Required').max(2, 'Must be a single emoji')
          },
          memorial: {
            type: 'emoji',
            label: 'Memorial Icon',
            placeholder: '🕊️',
            rules: z.string().min(1, 'Required').max(2, 'Must be a single emoji')
          },
          tribute: {
            type: 'emoji',
            label: 'Tribute Icon',
            placeholder: '💝',
            rules: z.string().min(1, 'Required').max(2, 'Must be a single emoji')
          }
        }
      },
      types: {
        type: 'field-group',
        label: 'Type Options',
        description: 'Configure available tribute types and their labels',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        class: 'gap-4',
        fields: {
          none: {
            type: 'field-group',
            class: 'gap-4',
            fields: {
              label: {
                type: 'text',
                label: 'None Option Label',
                placeholder: 'No, thank you'
              }
            }
          },
          gift: {
            type: 'field-group',
            legend: 'Gift Option',
            class: 'border p-4 rounded-lg gap-4',
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Enable Gift Option',
                description: 'Allow donors to make gifts to someone'
              },
              label: {
                type: 'text',
                label: 'Gift Option Label',
                placeholder: '🎁 Gift to someone',
                visibleWhen: (values) => {
                  const types = values.types as Record<string, unknown>
                  const gift = types?.gift as Record<string, unknown> | undefined
                  return gift?.enabled === true
                }
              }
            }
          },
          memorial: {
            type: 'field-group',
            legend: 'Memorial Option',
            class: 'border p-4 rounded-lg gap-4',
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Enable Memorial Option',
                description: 'Allow donors to make donations in memory of someone'
              },
              label: {
                type: 'text',
                label: 'Memorial Option Label',
                placeholder: '🕊️ In memory of someone',
                visibleWhen: (values) => {
                  const types = values.types as Record<string, unknown>
                  const memorial = types?.memorial as Record<string, unknown> | undefined
                  return memorial?.enabled === true
                }
              }
            }
          }
        }
      },
      modal: {
        type: 'field-group',
        label: 'Modal Settings',
        description: 'Text content for the tribute modal',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        class: 'gap-4',
        fields: {
          title: {
            type: 'text',
            label: 'Modal Title',
            placeholder: 'Gift or In Memory'
          },
          subtitle: {
            type: 'text',
            label: 'Modal Subtitle',
            placeholder: 'Make this donation in honor or memory of someone special'
          }
        }
      }
    }
  }
}
