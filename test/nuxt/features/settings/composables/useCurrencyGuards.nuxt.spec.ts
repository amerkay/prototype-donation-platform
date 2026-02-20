import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFormsStore } from '~/features/campaigns/shared/stores/forms'
import {
  findFormsUsingCurrencies,
  stripCurrenciesFromForms
} from '~/features/settings/admin/composables/useCurrencyGuards'
import type { Campaign } from '~/features/campaigns/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'

let testCounter = 0

function uniqueId(prefix: string) {
  return `${prefix}-${++testCounter}`
}

function makeCampaign(id: string, name: string, type: Campaign['type'] = 'standard'): Campaign {
  return {
    id,
    name,
    type,
    status: 'active',
    createdAt: '',
    updatedAt: '',
    stats: {} as Campaign['stats'],
    crowdfunding: {} as Campaign['crowdfunding'],
    peerToPeer: {} as Campaign['peerToPeer'],
    fundraisers: [],
    recentDonations: [],
    forms: []
  }
}

function makeConfig(opts: {
  baseDefaultCurrency?: string
  enabledCurrencies?: string[]
  noDA?: boolean
}): FullFormConfig {
  if (opts.noDA) return {} as FullFormConfig
  return {
    donationAmounts: {
      baseDefaultCurrency: opts.baseDefaultCurrency ?? 'GBP',
      enabledCurrencies: opts.enabledCurrencies ?? ['GBP', 'USD', 'EUR']
    }
  } as FullFormConfig
}

function seedForm(
  store: ReturnType<typeof useFormsStore>,
  campaignId: string,
  formId: string,
  name: string,
  config: FullFormConfig
) {
  store.addForm(campaignId, formId, name, config, [])
}

describe('findFormsUsingCurrencies', () => {
  let formsStore: ReturnType<typeof useFormsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    formsStore = useFormsStore()
  })

  it('returns empty arrays when no currencies removed', () => {
    const result = findFormsUsingCurrencies(new Set(), [], formsStore)
    expect(result.defaultBlocked).toEqual([])
    expect(result.enabledOnly).toEqual([])
    expect(result.enabledOnlyIds).toEqual([])
  })

  it('returns empty arrays when removed currency not used by any form', () => {
    const cid = uniqueId('camp')
    const campaign = makeCampaign(cid, 'Campaign 1')
    seedForm(formsStore, cid, 'f1', 'Form 1', makeConfig({ enabledCurrencies: ['GBP', 'USD'] }))

    const result = findFormsUsingCurrencies(new Set(['CAD']), [campaign], formsStore)
    expect(result.defaultBlocked).toEqual([])
    expect(result.enabledOnly).toEqual([])
  })

  it('blocks when removed currency is baseDefaultCurrency on a form', () => {
    const cid = uniqueId('camp')
    const campaign = makeCampaign(cid, 'Camp A')
    seedForm(formsStore, cid, 'f1', 'Main Form', makeConfig({ baseDefaultCurrency: 'USD' }))

    const result = findFormsUsingCurrencies(new Set(['USD']), [campaign], formsStore)
    expect(result.defaultBlocked).toHaveLength(1)
    expect(result.defaultBlocked[0]!.campaignName).toBe('Camp A')
    expect(result.defaultBlocked[0]!.formName).toBe('Main Form')
    expect(result.enabledOnly).toEqual([])
  })

  it('blocks multiple forms when currency is baseDefault on each', () => {
    const cid1 = uniqueId('camp')
    const cid2 = uniqueId('camp')
    const campaigns = [makeCampaign(cid1, 'Camp 1'), makeCampaign(cid2, 'Camp 2')]
    seedForm(formsStore, cid1, 'f1', 'Form A', makeConfig({ baseDefaultCurrency: 'EUR' }))
    seedForm(formsStore, cid1, 'f2', 'Form B', makeConfig({ baseDefaultCurrency: 'EUR' }))
    seedForm(formsStore, cid2, 'f3', 'Form C', makeConfig({ baseDefaultCurrency: 'EUR' }))

    const result = findFormsUsingCurrencies(new Set(['EUR']), campaigns, formsStore)
    expect(result.defaultBlocked).toHaveLength(3)
  })

  it('returns enabledOnly when currency only in enabledCurrencies', () => {
    const cid = uniqueId('camp')
    const campaign = makeCampaign(cid, 'Camp')
    seedForm(
      formsStore,
      cid,
      'f1',
      'Form 1',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD', 'EUR'] })
    )

    const result = findFormsUsingCurrencies(new Set(['EUR']), [campaign], formsStore)
    expect(result.defaultBlocked).toEqual([])
    expect(result.enabledOnly).toHaveLength(1)
    expect(result.enabledOnlyIds).toHaveLength(1)
    expect(result.enabledOnlyIds[0]).toEqual({ campaignId: cid, formId: 'f1' })
  })

  it('separates default-blocked from enabled-only in mixed scenario', () => {
    const cid = uniqueId('camp')
    const campaign = makeCampaign(cid, 'Mixed')
    seedForm(
      formsStore,
      cid,
      'f1',
      'Default USD',
      makeConfig({ baseDefaultCurrency: 'USD', enabledCurrencies: ['USD', 'EUR'] })
    )
    seedForm(
      formsStore,
      cid,
      'f2',
      'Enabled USD',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD'] })
    )

    const result = findFormsUsingCurrencies(new Set(['USD']), [campaign], formsStore)
    expect(result.defaultBlocked).toHaveLength(1)
    expect(result.defaultBlocked[0]!.formName).toBe('Default USD')
    expect(result.enabledOnly).toHaveLength(1)
    expect(result.enabledOnly[0]!.formName).toBe('Enabled USD')
  })

  it('excludes fundraiser campaigns', () => {
    const cid1 = uniqueId('camp')
    const cid2 = uniqueId('camp')
    const campaigns = [
      makeCampaign(cid1, 'Standard', 'standard'),
      makeCampaign(cid2, 'Fundraiser', 'fundraiser')
    ]
    seedForm(formsStore, cid1, 'f1', 'Std Form', makeConfig({ baseDefaultCurrency: 'USD' }))
    seedForm(formsStore, cid2, 'f2', 'FR Form', makeConfig({ baseDefaultCurrency: 'USD' }))

    const result = findFormsUsingCurrencies(new Set(['USD']), campaigns, formsStore)
    expect(result.defaultBlocked).toHaveLength(1)
    expect(result.defaultBlocked[0]!.campaignName).toBe('Standard')
  })

  it('skips forms without donationAmounts config', () => {
    const cid = uniqueId('camp')
    const campaign = makeCampaign(cid, 'Camp')
    seedForm(formsStore, cid, 'f1', 'No DA', makeConfig({ noDA: true }))

    const result = findFormsUsingCurrencies(new Set(['GBP']), [campaign], formsStore)
    expect(result.defaultBlocked).toEqual([])
    expect(result.enabledOnly).toEqual([])
  })

  it('handles multiple currencies removed simultaneously', () => {
    const cid = uniqueId('camp')
    const campaign = makeCampaign(cid, 'Camp')
    seedForm(
      formsStore,
      cid,
      'f1',
      'Enabled Only',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD', 'EUR', 'CAD'] })
    )
    seedForm(
      formsStore,
      cid,
      'f2',
      'Default USD',
      makeConfig({ baseDefaultCurrency: 'USD', enabledCurrencies: ['USD', 'EUR'] })
    )

    const result = findFormsUsingCurrencies(new Set(['USD', 'EUR']), [campaign], formsStore)
    expect(result.defaultBlocked).toHaveLength(1)
    expect(result.defaultBlocked[0]!.formName).toBe('Default USD')
    expect(result.enabledOnly).toHaveLength(1)
    expect(result.enabledOnly[0]!.formName).toBe('Enabled Only')
  })
})

describe('stripCurrenciesFromForms', () => {
  let formsStore: ReturnType<typeof useFormsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    formsStore = useFormsStore()
  })

  it('removes currency from enabledCurrencies', () => {
    const cid = uniqueId('camp')
    seedForm(
      formsStore,
      cid,
      'f1',
      'Form',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD', 'EUR'] })
    )

    stripCurrenciesFromForms(['EUR'], [{ campaignId: cid, formId: 'f1' }], formsStore)

    const form = formsStore.getForms(cid).find((f) => f.id === 'f1')
    expect(form!.config.donationAmounts!.enabledCurrencies).toEqual(['GBP', 'USD'])
  })

  it('does not touch baseDefaultCurrency', () => {
    const cid = uniqueId('camp')
    seedForm(
      formsStore,
      cid,
      'f1',
      'Form',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD'] })
    )

    stripCurrenciesFromForms(['USD'], [{ campaignId: cid, formId: 'f1' }], formsStore)

    const form = formsStore.getForms(cid).find((f) => f.id === 'f1')
    expect(form!.config.donationAmounts!.baseDefaultCurrency).toBe('GBP')
  })

  it('handles form with empty enabledCurrencies', () => {
    const cid = uniqueId('camp')
    seedForm(
      formsStore,
      cid,
      'f1',
      'Form',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: [] })
    )

    stripCurrenciesFromForms(['USD'], [{ campaignId: cid, formId: 'f1' }], formsStore)

    const form = formsStore.getForms(cid).find((f) => f.id === 'f1')
    expect(form!.config.donationAmounts!.enabledCurrencies).toEqual([])
  })

  it('calls updateFormConfig for each affected form', () => {
    const cid = uniqueId('camp')
    seedForm(formsStore, cid, 'f1', 'Form 1', makeConfig({ enabledCurrencies: ['GBP', 'USD'] }))
    seedForm(formsStore, cid, 'f2', 'Form 2', makeConfig({ enabledCurrencies: ['GBP', 'EUR'] }))

    const spy = vi.spyOn(formsStore, 'updateFormConfig')

    stripCurrenciesFromForms(
      ['USD', 'EUR'],
      [
        { campaignId: cid, formId: 'f1' },
        { campaignId: cid, formId: 'f2' }
      ],
      formsStore
    )

    expect(spy).toHaveBeenCalledTimes(2)
  })
})
