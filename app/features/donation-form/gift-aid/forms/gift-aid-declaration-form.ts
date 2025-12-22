import type { FormDef } from '~/features/form-builder/form-builder-types'
import { createGiftAidFields } from '~/features/donation-form/gift-aid/forms/gift-aid-fields'

/**
 * Gift Aid form section
 *
 * Collects Gift Aid consent and home address for UK donors (GBP currency only).
 * Includes option to reuse shipping address if available.
 *
 * Features:
 * - Gift Aid information card with eligibility requirements
 * - Consent toggle
 * - Home address collection (required by HMRC)
 * - Option to copy from shipping address
 *
 * Note: Cover costs fields are handled separately via CoverCostsField component
 * in DonationFormStep3.vue for dynamic percentage/amount switching based on donation amount.
 */
export const giftAidFormSection: FormDef = {
  id: 'gift-aid',
  //   title: 'Gift Aid (UK Taxpayers Only)',
  fields: createGiftAidFields()
}
