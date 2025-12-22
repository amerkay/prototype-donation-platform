import type { FormDef } from '~/features/form-builder/form-builder-types'
import { createGiftAidFields } from '../gift-aid/forms/gift-aid-fields'
import { createEmailOptInField } from './email-opt-in-field'
import { createTermsAcceptanceField } from './terms-acceptance-field'

/**
 * Step 3 form section - Final donation details
 *
 * Includes:
 * - Gift Aid consent (UK donors only)
 * - Email list opt-in
 * - Terms acceptance (required)
 *
 * Note: Cover costs is now handled separately via CoverCostsField component
 * in DonationFormStep3.vue for dynamic percentage/amount switching
 */
export function createStep3FormSection(): FormDef {
  return {
    id: 'step3',
    fields: {
      // Gift Aid fields (UK donors only)
      ...createGiftAidFields(),

      // Email list opt-in (extracted utility)
      ...createEmailOptInField(),

      // Terms acceptance (extracted utility)
      ...createTermsAcceptanceField()
    }
  }
}
