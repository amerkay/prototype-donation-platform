import * as z from 'zod'
import {
  defineForm,
  textField,
  componentField,
  fieldGroup,
  alertField
} from '~/features/_library/form-builder/api'
import FormTypeBadge from '~/features/donation-form/admin/components/FormTypeBadge.vue'

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

  const formType = componentField('formType', {
    component: FormTypeBadge,
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
