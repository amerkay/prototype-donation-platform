import { defineForm, toggleField } from '~/features/_library/form-builder/api'

/**
 * Social sharing settings form
 * Handles which social platforms are enabled for sharing
 */
export const useSocialSharingForm = defineForm('socialSharing', (_ctx) => {
  const enabled = toggleField('enabled', {
    label: 'Enable Social Sharing',
    description: 'Allow visitors to share this campaign on social media',
    labelClass: 'font-bold',
    showSeparatorAfter: true
  })

  const facebook = toggleField('facebook', {
    label: 'Facebook',
    description: 'Enable sharing to Facebook',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  const twitter = toggleField('twitter', {
    label: 'Twitter',
    description: 'Enable sharing to Twitter/X',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  const linkedin = toggleField('linkedin', {
    label: 'LinkedIn',
    description: 'Enable sharing to LinkedIn',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  const whatsapp = toggleField('whatsapp', {
    label: 'WhatsApp',
    description: 'Enable sharing to WhatsApp',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  const email = toggleField('email', {
    label: 'Email',
    description: 'Enable sharing via email',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  const copyLink = toggleField('copyLink', {
    label: 'Copy Link',
    description: 'Enable copy link to clipboard button',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  return { enabled, facebook, twitter, linkedin, whatsapp, email, copyLink }
})
