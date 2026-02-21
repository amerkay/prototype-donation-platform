import * as z from 'zod'
import {
  defineForm,
  textField,
  readonlyField,
  fieldGroup,
  alertField
} from '~/features/_library/form-builder/api'

/**
 * Basic donation form settings (title, subtitle, form type, branding info)
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

  const formType = readonlyField('formType', {
    label: 'Form Type',
    helpText:
      'Form type is set at creation and cannot be changed. Donation forms include Gift Aid, Cover Costs, Tribute, Impact Boost, and Donation Amounts. Registration forms hide these donation-specific features.',
    variant: 'badge',
    formatValue: (v) => (v === 'registration' ? 'Registration' : 'Donation'),
    defaultValue: 'donation'
  })

  const form = fieldGroup('form', {
    showSeparatorAfter: true,
    fields: { formType, title: formTitle, subtitle: formSubtitle }
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
