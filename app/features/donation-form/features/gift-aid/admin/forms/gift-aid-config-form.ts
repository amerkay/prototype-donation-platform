import { defineForm, toggleField } from '~/features/_library/form-builder/api'

/**
 * Create Gift Aid config section definition
 * Returns the form configuration for editing Gift Aid settings
 */
export const useGiftAidConfigSection = defineForm('giftAid', (_ctx) => {
  const enabled = toggleField('enabled', {
    label: 'Enable Gift Aid Feature',
    description: 'Show Gift Aid consent for UK donors (GBP currency only)',
    labelClass: 'font-bold',
    showSeparatorAfter: true
  })

  return { enabled }
})
