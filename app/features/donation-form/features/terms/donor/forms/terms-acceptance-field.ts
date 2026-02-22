import * as z from 'zod'
import type { FieldDef } from '~/features/_library/form-builder/types'
import { componentField } from '~/features/_library/form-builder/api'
import TermsAcceptanceField from '~/features/donation-form/features/terms/donor/components/TermsAcceptanceField.vue'

/**
 * Create reusable terms acceptance component field
 *
 * Renders a switch with label, description, and "View terms" link.
 * Link opens a modal (mode='content') or external URL (mode='link').
 */
export function createTermsAcceptanceField(
  visibleWhen?: (ctx: { values: Record<string, unknown> }) => boolean,
  config?: {
    label?: string
    description?: string
    mode?: string
    externalUrl?: string
    richContent?: string
  }
): Record<string, FieldDef> {
  const acceptTerms = componentField('acceptTerms', {
    component: TermsAcceptanceField,
    props: { config: config ?? {} },
    visibleWhen,
    defaultValue: false,
    rules: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions to continue'
    }),
    class: '-mt-2'
  })

  return { acceptTerms }
}
