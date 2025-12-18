import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'
import type { FormConfig } from '@/lib/common/types'
import { createGiftAidFields } from './gift-aid-fields'
import { createCoverFeesField } from './cover-fees-field'
import { createEmailOptInField } from './email-opt-in-field'
import { createTermsAcceptanceField } from './terms-acceptance-field'

/**
 * Step 3 form section - Final donation details
 *
 * Includes:
 * - Gift Aid consent (UK donors only)
 * - Cover fees option (configurable heading/description)
 * - Email list opt-in
 * - Terms acceptance (required)
 */
export function createStep3FormSection(
  config: FormConfig['features']['coverCosts']
): ConfigSectionDef {
  return {
    id: 'giftAid',
    fields: {
      // Gift Aid fields (UK donors only)
      ...createGiftAidFields(),

      // Cover fees fields (only if enabled)
      ...(config.enabled
        ? createCoverFeesField({
            minValue: 0,
            maxValue: 30,
            heading: config.heading,
            description: config.description
          })
        : {}),

      // Email list opt-in (extracted utility)
      ...createEmailOptInField(),

      // Terms acceptance (extracted utility)
      ...createTermsAcceptanceField()
    }
  }
}
