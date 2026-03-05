import { describe, it, expect } from 'vitest'
import * as z from 'zod'
import { tabsField, numberField } from '~/features/_library/form-builder/api'
import { validateField } from '~/features/_library/form-builder/utils/validation'
import type { FieldContext } from '~/features/_library/form-builder/types'

/**
 * Regression test: validateTabs must skip tabs with visibleWhen returning false.
 *
 * Bug: Event/registration forms showed "Please fix errors before saving" on load
 * because schema validation ran on hidden tabs (e.g., Donation Amounts tab hidden
 * for event campaigns via visibleWhen: () => caps.allowsDonationAmounts).
 */
describe('validateTabs respects tab visibleWhen', () => {
  const fieldContext: FieldContext = { values: {}, parent: {}, root: {} }

  const tabs = tabsField('frequencies', {
    tabs: [
      {
        value: 'visible',
        label: 'Visible Tab',
        visibleWhen: () => true,
        fields: {
          amount: numberField('amount', { label: 'Amount', rules: z.number().min(1) })
        }
      },
      {
        value: 'hidden',
        label: 'Hidden Tab',
        visibleWhen: () => false,
        fields: {
          amount: numberField('amount', { label: 'Amount', rules: z.number().min(1) })
        }
      }
    ]
  })

  it('validates visible tab fields', () => {
    const errors = new Map<string, string>()
    validateField(
      tabs,
      { visible: { amount: 0 }, hidden: { amount: 0 } },
      'root',
      fieldContext,
      errors
    )
    // Only the visible tab's field should produce an error
    expect(errors.size).toBe(1)
    expect(errors.has('root.visible.amount')).toBe(true)
    expect(errors.has('root.hidden.amount')).toBe(false)
  })

  it('skips hidden tab validation entirely', () => {
    const errors = new Map<string, string>()
    // Hidden tab has invalid data but should not produce errors
    validateField(
      tabs,
      { visible: { amount: 5 }, hidden: { amount: 0 } },
      'root',
      fieldContext,
      errors
    )
    expect(errors.size).toBe(0)
  })
})
