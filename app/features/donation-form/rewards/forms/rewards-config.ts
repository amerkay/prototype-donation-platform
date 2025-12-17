import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Create rewards config section definition
 * Returns the form configuration for editing rewards feature settings
 */
export function createRewardsConfigSection(): ConfigSectionDef {
  return {
    id: 'rewards',
    // title: 'Rewards & Gifts',
    // description: 'Configure free gift rewards based on donation thresholds',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Rewards',
        description: 'Show free gift rewards when donation meets threshold',
        labelClass: 'font-bold'
      },
      chooseProducts: {
        type: 'field-group',
        label: 'Choose gift products',
        collapsible: true,
        collapsibleDefaultOpen: false,
        badgeLabel: 'On my TODO list',
        badgeVariant: 'secondary',
        isDisabled: true
      },
      ui: {
        type: 'field-group',
        label: 'UI Labels',
        description: 'Configure text labels for rewards display',
        visibleWhen: (values) => values.enabled === true,
        collapsible: true,
        collapsibleDefaultOpen: false,

        fields: {
          labels: {
            type: 'field-group',
            class: 'grid grid-cols-2 gap-x-3',
            fields: {
              freeGifts: {
                type: 'text',
                label: 'Free Gifts Label',
                placeholder: 'Free Gifts',
                rules: z.string().min(1, 'Required')
              },
              freeWithDonation: {
                type: 'text',
                label: 'Free With Donation Label',
                placeholder: 'Free with your donation',
                rules: z.string().min(1, 'Required')
              }
            }
          }
        }
      }
    }
  }
}
