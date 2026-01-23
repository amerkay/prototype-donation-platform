import * as z from 'zod'
import type { FieldDef } from '~/features/_library/form-builder/types'
import { toggleField } from '~/features/_library/form-builder/api'

/**
 * Create reusable terms acceptance toggle field
 *
 * Provides a consistent required terms acceptance pattern with Zod validation.
 *
 * @param visibleWhen - Function that determines when field should be visible
 * @returns Record with acceptTerms field
 *
 * @example
 * ```typescript
 * const fields = {
 *   ...otherFields,
 *   ...createTermsAcceptanceField()
 * }
 * ```
 */
export function createTermsAcceptanceField(
  visibleWhen?: (ctx: { values: Record<string, unknown> }) => boolean
): Record<string, FieldDef> {
  const acceptTerms = toggleField('acceptTerms', {
    label: 'I accept the terms and conditions',
    description: 'I agree to the Terms of Service and Privacy Policy.',
    visibleWhen,
    defaultValue: false,
    rules: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions to continue'
    })
  })

  return { acceptTerms }
}
