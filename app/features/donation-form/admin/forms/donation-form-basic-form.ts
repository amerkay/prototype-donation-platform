import * as z from 'zod'
import {
  defineForm,
  textField,
  selectField,
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

  const formType = selectField('formType', {
    label: 'Form Type',
    description:
      'Non-donation types hide donation-specific features (Gift Aid, Cover Costs, Tribute, Impact Boost, Donation Amounts).',
    defaultValue: 'donation',
    options: [
      { value: 'donation', label: 'Donation' },
      { value: 'registration', label: 'Registration' }
    ]
  })

  const form = fieldGroup('form', {
    showSeparatorAfter: true,
    fields: { title: formTitle, subtitle: formSubtitle, formType }
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
