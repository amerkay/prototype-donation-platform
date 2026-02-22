import {
  defineForm,
  toggleField,
  fieldGroup,
  textField
} from '~/features/_library/form-builder/api'

/**
 * Admin config section for Contact Consent (email opt-in) feature
 */
export const useContactConsentConfigSection = defineForm('contactConsent', (_ctx) => {
  const enabled = toggleField('enabled', {
    label: 'Enable Email Opt-in',
    description: 'Show email subscription option to donors',
    labelClass: 'font-bold',
    showSeparatorAfter: true
  })

  const label = textField('label', {
    label: 'Checkbox Label',
    description: 'Text shown next to the email opt-in checkbox',
    placeholder: 'Join our email list'
  })

  const description = textField('description', {
    label: 'Description',
    description: 'Additional text shown below the checkbox',
    placeholder: 'Get updates on our impact and latest news. Unsubscribe anytime.'
  })

  const settings = fieldGroup('settings', {
    label: 'Opt-in Settings',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    showSeparatorAfter: true,
    fields: { label, description }
  })

  return { enabled, settings }
})
