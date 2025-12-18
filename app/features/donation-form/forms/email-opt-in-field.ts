import type { FieldMetaMap } from '~/features/form-builder/form-builder-types'

/**
 * Create reusable email opt-in toggle field
 *
 * Provides a consistent email subscription pattern with optional toggle.
 *
 * @param visibilityCondition - Function that determines when field should be visible
 * @returns FieldMetaMap object with joinEmailList field
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
  visibilityCondition?: (values: Record<string, unknown>) => boolean
): FieldMetaMap {
  return {
    joinEmailList: {
      type: 'toggle',
      label: 'Join our email list',
      description: 'Get updates on our impact and latest news. Unsubscribe anytime.',
      optional: true,
      visibleWhen: visibilityCondition,
      isNoSeparatorAfter: true
    }
  }
}
