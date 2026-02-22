import type { FieldDef } from '~/features/_library/form-builder/types'
import { checkboxField } from '~/features/_library/form-builder/api'

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
  visibleWhen?: (ctx: { values: Record<string, unknown> }) => boolean,
  config?: { label?: string; description?: string }
): Record<string, FieldDef> {
  const joinEmailList = checkboxField('joinEmailList', {
    label: config?.label || 'Join our email list',
    description:
      config?.description || 'Get updates on our impact and latest news. Unsubscribe anytime.',
    defaultValue: false,
    optional: true,
    visibleWhen
  })

  return { joinEmailList }
}
