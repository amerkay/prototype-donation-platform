import { defineForm, toggleField } from '~/features/form-builder/api'

/**
 * Social sharing settings form
 * Handles which social platforms are enabled for sharing
 */
export const useSocialSharingForm = defineForm('socialSharing', (_ctx) => {
  const facebook = toggleField('facebook', {
    label: 'Facebook',
    description: 'Enable sharing to Facebook',
    optional: true
  })

  const twitter = toggleField('twitter', {
    label: 'Twitter',
    description: 'Enable sharing to Twitter/X',
    optional: true
  })

  const linkedin = toggleField('linkedin', {
    label: 'LinkedIn',
    description: 'Enable sharing to LinkedIn',
    optional: true
  })

  const whatsapp = toggleField('whatsapp', {
    label: 'WhatsApp',
    description: 'Enable sharing to WhatsApp',
    optional: true
  })

  const email = toggleField('email', {
    label: 'Email',
    description: 'Enable sharing via email',
    optional: true
  })

  const copyLink = toggleField('copyLink', {
    label: 'Copy Link',
    description: 'Enable copy link to clipboard button',
    optional: true
  })

  return { facebook, twitter, linkedin, whatsapp, email, copyLink }
})
