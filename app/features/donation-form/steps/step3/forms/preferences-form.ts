import type { FormDef } from '~/features/form-builder/form-builder-types'
import { createEmailOptInField } from '~/features/donation-form/contact-consent/forms/email-opt-in-field'
import { createTermsAcceptanceField } from '~/features/donation-form/terms/forms/terms-acceptance-field'

/**
 * Preferences form section
 *
 * Collects final user preferences before payment:
 * - Email list subscription opt-in
 * - Terms and conditions acceptance (required)
 *
 * This section is always visible and required for all donors regardless of currency.
 */
export const preferencesFormSection: FormDef = {
  id: 'preferences',
  //   title: 'Final Details',
  fields: {
    ...createEmailOptInField(),
    ...createTermsAcceptanceField()
  }
}
