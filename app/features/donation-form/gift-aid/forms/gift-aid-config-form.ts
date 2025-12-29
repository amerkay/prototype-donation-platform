import type { FormDef } from '~/features/form-builder/types'

/**
 * Create Gift Aid config section definition
 * Returns the form configuration for editing Gift Aid settings
 */
export function createGiftAidConfigSection(): FormDef {
  return {
    id: 'giftAid',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Gift Aid Feature',
        description: 'Show Gift Aid consent for UK donors (GBP currency only)',
        labelClass: 'font-bold'
      }
    }
  }
}
