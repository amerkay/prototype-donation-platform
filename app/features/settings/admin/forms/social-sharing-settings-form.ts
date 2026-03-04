import {
  defineForm,
  toggleField,
  alertField,
  fieldGroup
} from '~/features/_library/form-builder/api'

/**
 * Social sharing settings form (org-level)
 * Handles which social platforms are available for sharing across all campaigns.
 * Enabling/disabling sharing per campaign is done in crowdfunding page settings.
 */
export const useSocialSharingSettingsForm = defineForm('socialSharing', (_ctx) => {
  const platformsNotice = alertField('platformsNotice', {
    variant: 'info',
    description:
      'Enable or disable sharing per campaign in the crowdfunding page settings. The toggles below control which platforms are available org-wide.',
    showSeparatorAfter: true
  })

  const facebook = toggleField('facebook', {
    label: 'Facebook',
    description: 'Enable sharing to Facebook'
  })

  const twitter = toggleField('twitter', {
    label: 'Twitter',
    description: 'Enable sharing to Twitter/X'
  })

  const linkedin = toggleField('linkedin', {
    label: 'LinkedIn',
    description: 'Enable sharing to LinkedIn'
  })

  const whatsapp = toggleField('whatsapp', {
    label: 'WhatsApp',
    description: 'Enable sharing to WhatsApp'
  })

  const email = toggleField('email', {
    label: 'Email',
    description: 'Enable sharing via email'
  })

  const socialSharing = fieldGroup('socialSharing', {
    label: 'Social Sharing',
    description: 'Configure which social platforms visitors can use to share campaigns.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { platformsNotice, facebook, twitter, linkedin, whatsapp, email },
    $storePath: 'flatten'
  })

  return { socialSharing }
})
