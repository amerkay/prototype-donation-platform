import * as z from 'zod'
import {
  defineForm,
  toggleField,
  fieldGroup,
  textField,
  emojiField
} from '~/features/_library/form-builder/api'

/**
 * Create tribute config section definition
 * Returns the form configuration for editing tribute settings in admin
 */
export const useTributeConfigSection = defineForm('tribute', (_ctx) => {
  // ctx.title = 'Tribute Settings'
  // ctx.description = 'Configure tribute, gift, and memorial donation options'

  const enabled = toggleField('enabled', {
    label: 'Enable Tribute Feature',
    description: 'Allow donors to dedicate donations as gifts or memorials',
    labelClass: 'font-bold',
    isSeparatorAfter: true
  })

  const showForOnceFrequency = toggleField('showForOnceFrequency', {
    label: 'Show Tribute button for One-time donations',
    description:
      'Allow donors to make tribute gifts with one-time donations (enabled by default for recurring)',
    visibleWhen: ({ values }) => values.enabled === true,
    isSeparatorAfter: true
  })

  const ecardTemplate = fieldGroup('ecardTemplate', {
    label: 'eCard Template',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    badgeLabel: 'On my TODO list',
    badgeVariant: 'secondary',
    isDisabled: true,
    isSeparatorAfter: true,
    fields: {}
  })

  const giftEnabled = toggleField('giftEnabled', {
    label: 'Enable Gift Option',
    description: 'Allow donors to make gifts to someone'
  })

  const memorialEnabled = toggleField('memorialEnabled', {
    label: 'Enable Memorial Option',
    description: 'Allow donors to make donations in memory of someone'
  })

  const types = fieldGroup('types', {
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
    fields: { giftEnabled, memorialEnabled }
  })

  const modalTitle = textField('title', {
    label: 'Modal Title',
    placeholder: 'Gift or In Memory'
  })

  const modalSubtitle = textField('subtitle', {
    label: 'Modal Subtitle',
    placeholder: 'Make this donation in honor or memory of someone special'
  })

  const modal = fieldGroup('modal', {
    label: 'Modal Settings',
    description: 'Text content for the tribute modal',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    isSeparatorAfter: true,
    fields: { title: modalTitle, subtitle: modalSubtitle }
  })

  const giftIcon = emojiField('gift', {
    label: 'Gift Icon',
    placeholder: '🎁',
    rules: z.string().min(1, 'Required')
  })

  const memorialIcon = emojiField('memorial', {
    label: 'Memorial Icon',
    placeholder: '🕊️',
    rules: z.string().min(1, 'Required')
  })

  const tributeIcon = emojiField('tribute', {
    label: 'Tribute Icon',
    placeholder: '💝',
    rules: z.string().min(1, 'Required')
  })

  const icons = fieldGroup('icons', {
    label: 'Icons',
    description: 'Emoji icons for different tribute types',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    class: 'sm:grid sm:grid-cols-3 sm:gap-3',
    isSeparatorAfter: true,
    fields: { gift: giftIcon, memorial: memorialIcon, tribute: tributeIcon }
  })

  return { enabled, showForOnceFrequency, ecardTemplate, types, modal, icons }
})
