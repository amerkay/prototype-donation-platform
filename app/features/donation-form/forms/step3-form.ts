import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'
import { createGiftAidFields } from './gift-aid-fields'
import { createCoverFeesField } from './cover-fees-field'
import { createEmailOptInField } from './email-opt-in-field'
import { createTermsAcceptanceField } from './terms-acceptance-field'

/**
 * Step 3 form section - Final donation details
 *
 * Includes:
 * - Gift Aid consent (UK donors only)
 * - Cover fees option
 * - Email list opt-in
 * - Terms acceptance (required)
 */
export const step3FormSection: ConfigSectionDef = {
  id: 'giftAid',
  fields: {
    // Gift Aid fields (UK donors only)
    ...createGiftAidFields(),

    // Cover fees fields
    ...createCoverFeesField({
      minValue: 0,
      maxValue: 30
    }),

    // Email list opt-in (extracted utility)
    ...createEmailOptInField(),

    // Terms acceptance (extracted utility)
    ...createTermsAcceptanceField()
  }
}
