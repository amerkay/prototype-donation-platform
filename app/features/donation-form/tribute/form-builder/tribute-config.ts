import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Tribute feature configuration schema
 */
export const tributeConfigSchema = z.object({
  enabled: z.boolean(),
  icons: z.object({
    gift: z.string().min(1, 'Gift icon is required'),
    memorial: z.string().min(1, 'Memorial icon is required'),
    tribute: z.string().min(1, 'Tribute icon is required')
  }),
  types: z.object({
    none: z.object({
      label: z.string().min(1, 'Label is required')
    }),
    gift: z.object({
      label: z.string().min(1, 'Label is required')
    }),
    memorial: z.object({
      label: z.string().min(1, 'Label is required')
    })
  }),
  modal: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().min(1, 'Subtitle is required'),
    saveButton: z.string().min(1, 'Save button text is required'),
    cancelButton: z.string().min(1, 'Cancel button text is required')
  })
})

/**
 * Tribute config section definition with field metadata
 */
export const tributeConfigSection: ConfigSectionDef<typeof tributeConfigSchema> = {
  id: 'tribute',
  title: 'Tribute Settings',
  description: 'Configure tribute, gift, and memorial donation options',
  schema: tributeConfigSchema,
  fields: {
    enabled: {
      type: 'toggle',
      label: 'Enable Tribute Feature',
      description: 'Allow donors to dedicate donations as gifts or memorials'
    },
    icons: {
      type: 'object',
      label: 'Icons',
      description: 'Emoji icons for different tribute types',
      fields: {
        gift: {
          type: 'text',
          label: 'Gift Icon',
          placeholder: '🎁'
        },
        memorial: {
          type: 'text',
          label: 'Memorial Icon',
          placeholder: '🕊️'
        },
        tribute: {
          type: 'text',
          label: 'Generic Tribute Icon',
          placeholder: '💝'
        }
      }
    },
    types: {
      type: 'object',
      label: 'Type Labels',
      description: 'Labels for each tribute type option',
      fields: {
        none: {
          type: 'object',
          fields: {
            label: {
              type: 'text',
              label: 'None Option Label',
              placeholder: 'No, thank you'
            }
          }
        },
        gift: {
          type: 'object',
          fields: {
            label: {
              type: 'text',
              label: 'Gift Option Label',
              placeholder: '🎁 Gift to someone'
            }
          }
        },
        memorial: {
          type: 'object',
          fields: {
            label: {
              type: 'text',
              label: 'Memorial Option Label',
              placeholder: '🕊️ In memory of someone'
            }
          }
        }
      }
    },
    modal: {
      type: 'object',
      label: 'Modal Settings',
      description: 'Text content for the tribute modal',
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
        },
        saveButton: {
          type: 'text',
          label: 'Save Button Text',
          placeholder: 'Save'
        },
        cancelButton: {
          type: 'text',
          label: 'Cancel Button Text',
          placeholder: 'Cancel'
        }
      }
    }
  }
}
