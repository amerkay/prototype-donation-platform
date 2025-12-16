import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Create shipping notice config section definition
 * Returns the form configuration for editing shipping notice settings
 */
export function createShippingNoticeConfigSection(): ConfigSectionDef {
  return {
    id: 'shippingNotice',
    // title: 'Shipping Notice',
    // description: 'Configure shipping notice displayed for physical rewards',
    fields: {
      showNotice: {
        type: 'toggle',
        label: 'Show Shipping Notice',
        description: 'Display shipping information notice to donors',
        classLabel: 'font-bold'
      },
      settings: {
        type: 'field-group',
        label: 'Notice Settings',
        visibleWhen: (values) => values.showNotice === true,
        collapsible: true,
        collapsibleDefaultOpen: false,

        fields: {
          noticeText: {
            type: 'text',
            label: 'Notice Text',
            description: 'The message shown to donors about shipping',
            placeholder: 'Shipping information will be collected at checkout.',
            rules: z.string().min(1, 'Notice text is required when enabled')
          }
        }
      }
    }
  }
}
