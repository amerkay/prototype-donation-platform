import * as z from 'zod'
import {
  defineForm,
  textField,
  fieldGroup,
  componentField
} from '~/features/_library/form-builder/api'
import BrandingSettingsInfo from '~/features/settings/admin/components/BrandingSettingsInfo.vue'

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

  const branding = componentField('branding', {
    component: BrandingSettingsInfo
  })

  return { form, branding }
})
