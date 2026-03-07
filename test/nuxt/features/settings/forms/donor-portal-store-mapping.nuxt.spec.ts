import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  generateStoreMapping,
  generateGetData,
  generateSetData
} from '~/features/_library/form-builder/utils/storeMapping'
import { useDonorPortalSettingsForm } from '~/features/settings/admin/forms/donor-portal-settings-form'
import { useDonorPortalSettingsStore } from '~/features/settings/admin/stores/donorPortalSettings'

describe('donor portal settings store mapping', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function getMapping() {
    return generateStoreMapping(useDonorPortalSettingsForm)
  }

  it('every store setting property is covered by a mapping', () => {
    const mapping = getMapping()
    const store = useDonorPortalSettingsStore()
    const storeTargets = new Set([...mapping.paths.values()])

    // Collect all leaf properties from the store (e.g., 'pauseSubscription.enabled')
    const storeKeys: string[] = []
    for (const [section, config] of Object.entries(store.$state)) {
      if (typeof config === 'object' && config !== null) {
        for (const key of Object.keys(config)) {
          storeKeys.push(`${section}.${key}`)
        }
      }
    }

    // Every store property should be targeted by at least one mapping
    for (const key of storeKeys) {
      expect(storeTargets.has(key), `store property "${key}" should have a form mapping`).toBe(true)
    }
  })

  it('all store paths resolve to existing store properties', () => {
    const mapping = getMapping()
    const store = useDonorPortalSettingsStore()

    for (const [formPath, storePath] of mapping.paths.entries()) {
      const segments = storePath.split('.')
      let value: unknown = store
      for (const segment of segments) {
        value = (value as Record<string, unknown>)?.[segment]
      }
      expect(
        value,
        `storePath "${storePath}" (from form "${formPath}") should exist`
      ).not.toBeUndefined()
    }
  })

  it('getData reads all store values into correct form paths', () => {
    const mapping = getMapping()
    const getData = generateGetData(mapping)
    const store = useDonorPortalSettingsStore()

    // Patch store with known non-default values
    store.$patch({
      pauseSubscription: { enabled: false, minDurationMonths: 6, minDonorValueLastYear: 100 },
      cancelSubscription: { enabled: false, minDurationMonths: 3, minDonorValueLastYear: 50 },
      changeAmount: { enabled: false, minDurationMonths: 12, minDonorValueLastYear: 200 },
      refundStandard: {
        enabled: false,
        windowDays: 90,
        minDurationMonths: 6,
        minDonorValueLastYear: 150,
        disableWhenCampaignEnded: true
      },
      refundP2P: { enabled: false, windowDays: 60, disableWhenCampaignEnded: true },
      refundMatchedGiving: { enabled: false, windowDays: 180, disableWhenCampaignEnded: true }
    })

    const formData = getData(store) as Record<string, unknown>

    // Navigate the deeply nested form structure
    function getFormValue(path: string): unknown {
      const segments = path.split('.')
      let value: unknown = formData
      for (const segment of segments) {
        value = (value as Record<string, unknown>)?.[segment]
      }
      return value
    }

    // Spot-check subscription fields
    expect(getFormValue('portal.topTabs.subscriptions.pause.pauseEnabled')).toBe(false)
    expect(getFormValue('portal.topTabs.subscriptions.pause.pauseDuration')).toBe(6)
    expect(getFormValue('portal.topTabs.subscriptions.pause.pauseMinValue')).toBe(100)
    expect(getFormValue('portal.topTabs.subscriptions.cancel.cancelEnabled')).toBe(false)
    expect(getFormValue('portal.topTabs.subscriptions.changeAmount.changeAmountDuration')).toBe(12)

    // Spot-check refund fields
    expect(getFormValue('portal.topTabs.refunds.standard.stdEnabled')).toBe(false)
    expect(getFormValue('portal.topTabs.refunds.standard.stdWindowDays')).toBe(90)
    expect(getFormValue('portal.topTabs.refunds.standard.stdDuration')).toBe(6)
    expect(getFormValue('portal.topTabs.refunds.standard.stdCampaignEnded')).toBe(true)
    expect(getFormValue('portal.topTabs.refunds.p2p.p2pEnabled')).toBe(false)
    expect(getFormValue('portal.topTabs.refunds.p2p.p2pWindowDays')).toBe(60)
    expect(getFormValue('portal.topTabs.refunds.p2p.p2pCampaignEnded')).toBe(true)
    expect(getFormValue('portal.topTabs.refunds.matchedGiving.matchEnabled')).toBe(false)
    expect(getFormValue('portal.topTabs.refunds.matchedGiving.matchWindowDays')).toBe(180)
    expect(getFormValue('portal.topTabs.refunds.matchedGiving.matchCampaignEnded')).toBe(true)
  })

  it('setData writes form values back to correct store properties', () => {
    const mapping = getMapping()
    const getData = generateGetData(mapping)
    const setData = generateSetData(mapping)
    const store = useDonorPortalSettingsStore()

    // Get current form data, modify it, then write back
    const formData = getData(store) as Record<string, unknown>

    // Helper to set a deeply nested value
    function setFormValue(path: string, value: unknown) {
      const segments = path.split('.')
      let target: Record<string, unknown> = formData
      for (let i = 0; i < segments.length - 1; i++) {
        target = target[segments[i]!] as Record<string, unknown>
      }
      target[segments[segments.length - 1]!] = value
    }

    // Modify values via form paths
    setFormValue('portal.topTabs.subscriptions.pause.pauseEnabled', false)
    setFormValue('portal.topTabs.subscriptions.pause.pauseDuration', 9)
    setFormValue('portal.topTabs.refunds.standard.stdWindowDays', 180)
    setFormValue('portal.topTabs.refunds.standard.stdCampaignEnded', true)
    setFormValue('portal.topTabs.refunds.p2p.p2pEnabled', false)
    setFormValue('portal.topTabs.refunds.p2p.p2pWindowDays', 90)
    setFormValue('portal.topTabs.refunds.matchedGiving.matchWindowDays', 60)
    setFormValue('portal.topTabs.refunds.matchedGiving.matchCampaignEnded', true)

    // Write back to store (markDirty is already on the store)
    setData(store as unknown as { markDirty: () => void }, formData)

    // Verify store was updated
    expect(store.pauseSubscription.enabled).toBe(false)
    expect(store.pauseSubscription.minDurationMonths).toBe(9)
    expect(store.refundStandard.windowDays).toBe(180)
    expect(store.refundStandard.disableWhenCampaignEnded).toBe(true)
    expect(store.refundP2P.enabled).toBe(false)
    expect(store.refundP2P.windowDays).toBe(90)
    expect(store.refundMatchedGiving.windowDays).toBe(60)
    expect(store.refundMatchedGiving.disableWhenCampaignEnded).toBe(true)
  })

  it('display-only fields (matchAlert) are excluded from mapping', () => {
    const mapping = getMapping()
    const allPaths = [...mapping.paths.keys()]
    const alertPaths = allPaths.filter((p) => p.includes('matchAlert'))
    expect(alertPaths).toEqual([])
  })
})
