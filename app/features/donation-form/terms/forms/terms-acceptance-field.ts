import * as z from 'zod'
import type { FieldMetaMap } from '~/features/form-builder/form-builder-types'

/**
 * Create reusable terms acceptance toggle field
 *
 * Provides a consistent required terms acceptance pattern with Zod validation.
 *
 * @param visibilityCondition - Function that determines when field should be visible
 * @returns FieldMetaMap object with acceptTerms field
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
  visibilityCondition?: (values: Record<string, unknown>) => boolean
): FieldMetaMap {
  return {
    acceptTerms: {
      type: 'toggle',
      label: 'I accept the terms and conditions',
      description: 'I agree to the Terms of Service and Privacy Policy.',
      visibleWhen: visibilityCondition,
      rules: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions to continue'
      })
    }
  }
}
