import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { computed } from 'vue'
import { useDonorPortalSettingsForm } from '~/features/settings/admin/forms/donor-portal-settings-form'
import type {
  FieldContext,
  FieldGroupDef,
  TabsFieldDef,
  ToggleFieldDef
} from '~/features/_library/form-builder/types'

function makeCtx(values: Record<string, unknown>): FieldContext {
  return { values, root: values }
}

function setupForm() {
  return useDonorPortalSettingsForm.setup({
    values: computed(() => ({})),
    form: computed(() => ({}))
  })
}

/** Navigate: portal → topTabs → [tab] → grid → [section] */
function getSection(
  fields: ReturnType<typeof setupForm>,
  topTab: string,
  gridName: string,
  section: string
) {
  const portal = fields.portal as FieldGroupDef
  const topTabs = portal.fields.topTabs as TabsFieldDef
  const tab = topTabs.tabs.find((t) => t.value === topTab)!
  const grid = tab.fields[gridName] as FieldGroupDef
  return grid.fields[section] as FieldGroupDef
}

describe('donor-portal-settings-form descriptions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('standard refund toggle description', () => {
    function getStdRefundDescription() {
      const fields = setupForm()
      const stdGroup = getSection(fields, 'refunds', 'refundsGrid', 'standard')
      const enabled = stdGroup.fields.stdEnabled as ToggleFieldDef
      return enabled.description as (ctx: FieldContext) => string
    }

    it('shows disabled message when refund is off', () => {
      const desc = getStdRefundDescription()
      expect(desc(makeCtx({ stdEnabled: false }))).toBe('Disabled for all donors.')
    })

    it('shows window-only message when enabled with no other restrictions', () => {
      const desc = getStdRefundDescription()
      const result = desc(
        makeCtx({ stdEnabled: true, stdWindowDays: 30, stdDuration: 0, stdMinValue: 0 })
      )
      expect(result).toBe('Refund enabled if within 30 days of payment.')
    })

    it('includes duration condition when minDurationMonths > 0', () => {
      const desc = getStdRefundDescription()
      const result = desc(
        makeCtx({ stdEnabled: true, stdWindowDays: 60, stdDuration: 3, stdMinValue: 0 })
      )
      expect(result).toContain('within 60 days of payment')
      expect(result).toContain('subscription active for 3 months+')
    })

    it('includes donor value condition when minDonorValue > 0', () => {
      const desc = getStdRefundDescription()
      const result = desc(
        makeCtx({ stdEnabled: true, stdWindowDays: 90, stdDuration: 0, stdMinValue: 100 })
      )
      expect(result).toContain('within 90 days of payment')
      expect(result).toContain('donor value above')
      expect(result).toContain('100')
    })

    it('joins all conditions with AND when all restrictions are set', () => {
      const desc = getStdRefundDescription()
      const result = desc(
        makeCtx({ stdEnabled: true, stdWindowDays: 180, stdDuration: 6, stdMinValue: 50 })
      )
      expect(result).toContain('within 180 days of payment')
      expect(result).toContain('subscription active for 6 months+')
      expect(result).toContain('donor value above')
      const andCount = (result.match(/ AND /g) ?? []).length
      expect(andCount).toBe(2)
    })
  })

  describe('p2p refund toggle description', () => {
    it('shows only window in description (no duration/value conditions)', () => {
      const fields = setupForm()
      const p2pGroup = getSection(fields, 'refunds', 'refundsGrid', 'p2p')
      const enabled = p2pGroup.fields.p2pEnabled as ToggleFieldDef
      const desc = enabled.description as (ctx: FieldContext) => string

      const result = desc(makeCtx({ p2pEnabled: true, p2pWindowDays: 60 }))
      expect(result).toBe('Refund enabled if within 60 days of payment.')
    })
  })

  describe('actionSection toggle description (shared by pause / cancel / changeAmount)', () => {
    it('shows disabled message when cancel is off', () => {
      const fields = setupForm()
      const cancelGroup = getSection(fields, 'subscriptions', 'subscriptionsGrid', 'cancel')
      const cancelEnabled = cancelGroup.fields.cancelEnabled as ToggleFieldDef
      const desc = cancelEnabled.description as (ctx: FieldContext) => string

      expect(desc(makeCtx({ cancelEnabled: false }))).toBe('Disabled for all donors.')
    })

    it('shows open message when cancel is enabled with no restrictions', () => {
      const fields = setupForm()
      const cancelGroup = getSection(fields, 'subscriptions', 'subscriptionsGrid', 'cancel')
      const cancelEnabled = cancelGroup.fields.cancelEnabled as ToggleFieldDef
      const desc = cancelEnabled.description as (ctx: FieldContext) => string

      expect(desc(makeCtx({ cancelEnabled: true, cancelDuration: 0, cancelMinValue: 0 }))).toBe(
        'Enabled for all donors (no restrictions).'
      )
    })
  })

  describe('form structure', () => {
    it('has two top-level tabs: Subscriptions and Refunds', () => {
      const fields = setupForm()
      const portal = fields.portal as FieldGroupDef
      const topTabs = portal.fields.topTabs as TabsFieldDef
      expect(topTabs.tabs.map((t) => t.value)).toEqual(['subscriptions', 'refunds'])
    })

    it('subscriptions tab has 3 sections in a grid: Pause, Cancel, Change Amount', () => {
      const fields = setupForm()
      const portal = fields.portal as FieldGroupDef
      const topTabs = portal.fields.topTabs as TabsFieldDef
      const subTab = topTabs.tabs.find((t) => t.value === 'subscriptions')!
      const grid = subTab.fields.subscriptionsGrid as FieldGroupDef
      expect(Object.keys(grid.fields)).toEqual(['pause', 'cancel', 'changeAmount'])
    })

    it('refunds tab has 3 sections in a grid: Standard, P2P, Matched Giving', () => {
      const fields = setupForm()
      const portal = fields.portal as FieldGroupDef
      const topTabs = portal.fields.topTabs as TabsFieldDef
      const refTab = topTabs.tabs.find((t) => t.value === 'refunds')!
      const grid = refTab.fields.refundsGrid as FieldGroupDef
      expect(Object.keys(grid.fields)).toEqual(['standard', 'p2p', 'matchedGiving'])
    })

    it('standard refund has duration and minValue fields', () => {
      const fields = setupForm()
      const stdGroup = getSection(fields, 'refunds', 'refundsGrid', 'standard')
      expect(stdGroup.fields).toHaveProperty('stdDuration')
      expect(stdGroup.fields).toHaveProperty('stdMinValue')
    })

    it('p2p refund does NOT have duration or minValue fields', () => {
      const fields = setupForm()
      const p2pGroup = getSection(fields, 'refunds', 'refundsGrid', 'p2p')
      expect(p2pGroup.fields).not.toHaveProperty('p2pDuration')
      expect(p2pGroup.fields).not.toHaveProperty('p2pMinValue')
    })

    it('matched giving refund has alert field', () => {
      const fields = setupForm()
      const matchedGroup = getSection(fields, 'refunds', 'refundsGrid', 'matchedGiving')
      expect(matchedGroup.fields).toHaveProperty('matchAlert')
    })

    it('grid fieldGroups have responsive grid class', () => {
      const fields = setupForm()
      const portal = fields.portal as FieldGroupDef
      const topTabs = portal.fields.topTabs as TabsFieldDef
      const subTab = topTabs.tabs.find((t) => t.value === 'subscriptions')!
      const grid = subTab.fields.subscriptionsGrid as FieldGroupDef
      expect(grid.class).toContain('md:grid-cols-2')
      expect(grid.class).toContain('lg:grid-cols-3')
    })
  })
})
