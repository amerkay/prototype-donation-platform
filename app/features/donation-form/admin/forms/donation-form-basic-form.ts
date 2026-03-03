import * as z from 'zod'
import {
  defineForm,
  textField,
  readonlyField,
  fieldGroup,
  alertField
} from '~/features/_library/form-builder/api'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'

/**
 * Basic donation form settings (title, subtitle, form type badge, branding info)
 */
export const useDonationFormBasicForm = defineForm('formBasic', () => {
  const campaignStore = useCampaignConfigStore()

  const formTitle = textField('title', {
    label: 'Form Title',
    placeholder: 'Enter form title',
    rules: z.string().min(5, 'Title is required')
  })

  const formSubtitle = textField('subtitle', {
    label: 'Form Subtitle',
    placeholder: 'Enter form subtitle'
  })

  // Form type is derived from campaign type — shown as a read-only badge
  const derivedFormType = getCampaignCapabilities(campaignStore.type).formType
  const formType = readonlyField('formType', {
    label: 'Form Type',
    helpText:
      'Form type is determined by the campaign type. Donation forms include Gift Aid, Cover Costs, Tribute, Impact Boost, and Donation Amounts. Registration forms (events) hide these donation-specific features.',
    variant: 'badge',
    formatValue: () => (derivedFormType === 'registration' ? 'Registration' : 'Donation'),
    defaultValue: derivedFormType
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
