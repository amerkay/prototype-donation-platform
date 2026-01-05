import * as z from 'zod'
import type { FormDef } from '~/features/form-builder/types'

/**
 * Create tribute config section definition
 * Returns the form configuration for editing tribute settings in admin
 */
export function createTributeConfigSection(): FormDef {
  return {
    id: 'tribute',
    // title: 'Tribute Settings',
    // description: 'Configure tribute, gift, and memorial donation options',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Tribute Feature',
        description: 'Allow donors to dedicate donations as gifts or memorials',
        labelClass: 'font-bold',
        isSeparatorAfter: true
      },
      ecardTemplate: {
        type: 'field-group',
        label: 'eCard Template',
        visibleWhen: ({ values }) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        badgeLabel: 'On my TODO list',
        badgeVariant: 'secondary',
        isDisabled: true,
        isSeparatorAfter: true
      },
      types: {
        type: 'field-group',
        label: 'Type Options',
        description: 'Configure available tribute types and their labels',
        visibleWhen: ({ values }) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        isSeparatorAfter: true,

        rules: z
          .object({
            giftEnabled: z.boolean(),
            memorialEnabled: z.boolean()
          })
          .refine((data) => data.giftEnabled || data.memorialEnabled, {
            message: 'At least one of Gift or Memorial options must be enabled'
          }),
        fields: {
          giftEnabled: {
            type: 'toggle',
            label: 'Enable Gift Option',
            description: 'Allow donors to make gifts to someone'
          },
          memorialEnabled: {
            type: 'toggle',
            label: 'Enable Memorial Option',
            description: 'Allow donors to make donations in memory of someone'
          }
        }
      },
      modal: {
        type: 'field-group',
        label: 'Modal Settings',
        description: 'Text content for the tribute modal',
        visibleWhen: ({ values }) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        isSeparatorAfter: true,

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
      },
      icons: {
        type: 'field-group',
        label: 'Icons',
        description: 'Emoji icons for different tribute types',
        visibleWhen: ({ values }) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,
        class: 'sm:grid sm:grid-cols-3 sm:gap-3',
        isSeparatorAfter: true,
        fields: {
          gift: {
            type: 'emoji',
            label: 'Gift Icon',
            placeholder: '🎁',
            rules: z.string().min(1, 'Required')
          },
          memorial: {
            type: 'emoji',
            label: 'Memorial Icon',
            placeholder: '🕊️',
            rules: z.string().min(1, 'Required')
          },
          tribute: {
            type: 'emoji',
            label: 'Tribute Icon',
            placeholder: '💝',
            rules: z.string().min(1, 'Required')
          }
        }
      }
    }
  }
}
