import { defineForm, fieldGroup } from '~/features/_library/form-builder/api'

/**
 * Branding configuration for donation form
 */
export const useDonationFormBrandingForm = defineForm('formBranding', () => {
  const branding = fieldGroup('branding', {
    label: 'Branding',
    collapsible: true,
    collapsibleDefaultOpen: false,

    badgeLabel: 'On my TODO list',
    badgeVariant: 'secondary',
    disabled: true,

    showSeparatorAfter: true,
    fields: {}
  })

  return { branding }
})
