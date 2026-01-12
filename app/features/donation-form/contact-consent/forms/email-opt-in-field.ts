import type { FieldDef } from '~/features/form-builder/types'
import { toggleField } from '~/features/form-builder/api'

/**
 * Create reusable email opt-in toggle field
 *
 * Provides a consistent email subscription pattern with optional toggle.
 *
 * @param visibleWhen - Function that determines when field should be visible
 * @returns Record with joinEmailList field
 *
 * @example
 * ```typescript
 * const fields = {
 *   ...otherFields,
 *   ...createEmailOptInField((values) => values.country === 'GB')
 * }
 * ```
 */
export function createEmailOptInField(
  visibleWhen?: (ctx: { values: Record<string, unknown> }) => boolean
): Record<string, FieldDef> {
  const joinEmailList = toggleField('joinEmailList', {
    label: 'Join our email list',
    description: 'Get updates on our impact and latest news. Unsubscribe anytime.',
    defaultValue: false,
    optional: true,
    visibleWhen
  })

  return { joinEmailList }
}
