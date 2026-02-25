import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { computed } from 'vue'
import { useDonorPortalSettingsForm } from '~/features/settings/admin/forms/donor-portal-settings-form'
import type {
  FieldContext,
  FieldGroupDef,
  ToggleFieldDef
} from '~/features/_library/form-builder/types'

/**
 * Build a minimal FieldContext for testing description callbacks.
 * Only `values` is used by the description functions in this form.
 */
function makeCtx(values: Record<string, unknown>): FieldContext {
  return { values, root: values }
}

describe('donor-portal-settings-form descriptions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /**
   * Invoke the form's setup to get field definitions,
   * then extract the refundEnabled description callback.
   */
  function getRefundDescription() {
    const fields = useDonorPortalSettingsForm.setup({
      values: computed(() => ({})),
      form: computed(() => ({}))
    })
    const refundGroup = fields.refund as FieldGroupDef
    const refundEnabled = refundGroup.fields.refundEnabled as ToggleFieldDef
    return refundEnabled.description as (ctx: FieldContext) => string
  }

  describe('refundEnabled toggle description', () => {
    it('shows disabled message when refund is off', () => {
      const desc = getRefundDescription()
      expect(desc(makeCtx({ refundEnabled: false }))).toBe('Disabled for all donors.')
    })

    it('shows window-only message when enabled with no other restrictions', () => {
      const desc = getRefundDescription()
      const result = desc(
        makeCtx({ refundEnabled: true, refundWindowDays: 30, refundDuration: 0, refundMinValue: 0 })
      )
      expect(result).toBe('Refund enabled if within 30 days of payment.')
    })

    it('includes duration condition when minDurationMonths > 0', () => {
      const desc = getRefundDescription()
      const result = desc(
        makeCtx({ refundEnabled: true, refundWindowDays: 60, refundDuration: 3, refundMinValue: 0 })
      )
      expect(result).toContain('within 60 days of payment')
      expect(result).toContain('subscription active for 3 months+')
    })

    it('includes donor value condition when minDonorValue > 0', () => {
      const desc = getRefundDescription()
      const result = desc(
        makeCtx({
          refundEnabled: true,
          refundWindowDays: 90,
          refundDuration: 0,
          refundMinValue: 100
        })
      )
      expect(result).toContain('within 90 days of payment')
      expect(result).toContain('donor value above')
      expect(result).toContain('100')
    })

    it('joins all conditions with AND when all restrictions are set', () => {
      const desc = getRefundDescription()
      const result = desc(
        makeCtx({
          refundEnabled: true,
          refundWindowDays: 180,
          refundDuration: 6,
          refundMinValue: 50
        })
      )
      expect(result).toContain('within 180 days of payment')
      expect(result).toContain('subscription active for 6 months+')
      expect(result).toContain('donor value above')
      // AND joins each part
      const andCount = (result.match(/ AND /g) ?? []).length
      expect(andCount).toBe(2)
    })
  })

  describe('actionSection toggle description (shared by pause / cancel / changeAmount)', () => {
    it('shows disabled message when cancel is off', () => {
      const fields = useDonorPortalSettingsForm.setup({
        values: computed(() => ({})),
        form: computed(() => ({}))
      })
      const cancelGroup = fields.cancel as FieldGroupDef
      const cancelEnabled = cancelGroup.fields.cancelEnabled as ToggleFieldDef
      const desc = cancelEnabled.description as (ctx: FieldContext) => string

      expect(desc(makeCtx({ cancelEnabled: false }))).toBe('Disabled for all donors.')
    })

    it('shows open message when cancel is enabled with no restrictions', () => {
      const fields = useDonorPortalSettingsForm.setup({
        values: computed(() => ({})),
        form: computed(() => ({}))
      })
      const cancelGroup = fields.cancel as FieldGroupDef
      const cancelEnabled = cancelGroup.fields.cancelEnabled as ToggleFieldDef
      const desc = cancelEnabled.description as (ctx: FieldContext) => string

      expect(desc(makeCtx({ cancelEnabled: true, cancelDuration: 0, cancelMinValue: 0 }))).toBe(
        'Enabled for all donors (no restrictions).'
      )
    })
  })
})
