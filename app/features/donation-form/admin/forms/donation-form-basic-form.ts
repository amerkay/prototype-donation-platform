import * as z from 'zod'
import { defineForm, textField, fieldGroup, alertField } from '~/features/_library/form-builder/api'

/**
 * Basic donation form settings (title, subtitle, branding info)
 */
export const useDonationFormBasicForm = defineForm('formBasic', () => {
  const formTitle = textField('title', {
    label: 'Form Title',
    placeholder: 'Enter form title',
    rules: z.string().min(5, 'Title is required')
  })

  const formSubtitle = textField('subtitle', {
    label: 'Form Subtitle',
    placeholder: 'Enter form subtitle',
    optional: true
  })

  const form = fieldGroup('form', {
    showSeparatorAfter: true,
    fields: { title: formTitle, subtitle: formSubtitle }
  })

  const brandingNotice = alertField('branding', {
    variant: 'info',
    description:
      'Branding is configured at the organization level and applies to templates and donor facing forms and pages.',
    cta: {
      label: 'Edit branding settings',
      to: '/admin/settings/branding',
      inline: true
    }
  })

  return { form, brandingNotice }
})
