import { describe, it, expect } from 'vitest'
import {
  findFormsUsingCurrencies,
  stripCurrenciesFromForms
} from '~/features/settings/admin/composables/useCurrencyGuards'
import type { Campaign, CampaignForm } from '~/features/campaigns/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'

let testCounter = 0

function uniqueId(prefix: string) {
  return `${prefix}-${++testCounter}`
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

function makeForm(id: string, name: string, config: FullFormConfig): CampaignForm {
  return {
    id,
    campaignId: '',
    name,
    isDefault: true,
    config,
    products: [],
    createdAt: '',
    updatedAt: ''
  }
}

function makeCampaign(
  id: string,
  name: string,
  form: CampaignForm | null = null,
  type: Campaign['type'] = 'standard'
): Campaign {
  return {
    id,
    name,
    type,
    status: 'active',
    isArchived: false,
    createdAt: '',
    updatedAt: '',
    stats: {} as Campaign['stats'],
    crowdfunding: {} as Campaign['crowdfunding'],
    peerToPeer: {} as Campaign['peerToPeer'],
    fundraisers: [],
    recentDonations: [],
    matchedGiving: { periods: [] },
    form
  }
}

describe('findFormsUsingCurrencies', () => {
  it('returns empty arrays when no currencies removed', () => {
    const result = findFormsUsingCurrencies(new Set(), [])
    expect(result.defaultBlocked).toEqual([])
    expect(result.enabledOnly).toEqual([])
    expect(result.enabledOnlyIds).toEqual([])
  })

  it('returns empty arrays when removed currency not used by any form', () => {
    const cid = uniqueId('camp')
    const form = makeForm('f1', 'Form 1', makeConfig({ enabledCurrencies: ['GBP', 'USD'] }))
    const campaign = makeCampaign(cid, 'Campaign 1', form)

    const result = findFormsUsingCurrencies(new Set(['CAD']), [campaign])
    expect(result.defaultBlocked).toEqual([])
    expect(result.enabledOnly).toEqual([])
  })

  it('blocks when removed currency is baseDefaultCurrency on a form', () => {
    const cid = uniqueId('camp')
    const form = makeForm('f1', 'Main Form', makeConfig({ baseDefaultCurrency: 'USD' }))
    const campaign = makeCampaign(cid, 'Camp A', form)

    const result = findFormsUsingCurrencies(new Set(['USD']), [campaign])
    expect(result.defaultBlocked).toHaveLength(1)
    expect(result.defaultBlocked[0]!.campaignName).toBe('Camp A')
    expect(result.defaultBlocked[0]!.formName).toBe('Main Form')
    expect(result.enabledOnly).toEqual([])
  })

  it('blocks multiple campaigns when currency is baseDefault on each', () => {
    const cid1 = uniqueId('camp')
    const cid2 = uniqueId('camp')
    const campaigns = [
      makeCampaign(
        cid1,
        'Camp 1',
        makeForm('f1', 'Form A', makeConfig({ baseDefaultCurrency: 'EUR' }))
      ),
      makeCampaign(
        cid2,
        'Camp 2',
        makeForm('f2', 'Form B', makeConfig({ baseDefaultCurrency: 'EUR' }))
      )
    ]

    const result = findFormsUsingCurrencies(new Set(['EUR']), campaigns)
    expect(result.defaultBlocked).toHaveLength(2)
  })

  it('returns enabledOnly when currency only in enabledCurrencies', () => {
    const cid = uniqueId('camp')
    const form = makeForm(
      'f1',
      'Form 1',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD', 'EUR'] })
    )
    const campaign = makeCampaign(cid, 'Camp', form)

    const result = findFormsUsingCurrencies(new Set(['EUR']), [campaign])
    expect(result.defaultBlocked).toEqual([])
    expect(result.enabledOnly).toHaveLength(1)
    expect(result.enabledOnlyIds).toHaveLength(1)
    expect(result.enabledOnlyIds[0]).toEqual({ campaignId: cid })
  })

  it('separates default-blocked from enabled-only across campaigns', () => {
    const cid1 = uniqueId('camp')
    const cid2 = uniqueId('camp')
    const campaigns = [
      makeCampaign(
        cid1,
        'Default USD',
        makeForm(
          'f1',
          'Default USD',
          makeConfig({ baseDefaultCurrency: 'USD', enabledCurrencies: ['USD', 'EUR'] })
        )
      ),
      makeCampaign(
        cid2,
        'Enabled USD',
        makeForm(
          'f2',
          'Enabled USD',
          makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD'] })
        )
      )
    ]

    const result = findFormsUsingCurrencies(new Set(['USD']), campaigns)
    expect(result.defaultBlocked).toHaveLength(1)
    expect(result.defaultBlocked[0]!.formName).toBe('Default USD')
    expect(result.enabledOnly).toHaveLength(1)
    expect(result.enabledOnly[0]!.formName).toBe('Enabled USD')
  })

  it('excludes fundraiser campaigns', () => {
    const cid1 = uniqueId('camp')
    const cid2 = uniqueId('camp')
    const campaigns = [
      makeCampaign(
        cid1,
        'Standard',
        makeForm('f1', 'Std Form', makeConfig({ baseDefaultCurrency: 'USD' })),
        'standard'
      ),
      makeCampaign(
        cid2,
        'Fundraiser',
        makeForm('f2', 'FR Form', makeConfig({ baseDefaultCurrency: 'USD' })),
        'p2p-fundraiser'
      )
    ]

    const result = findFormsUsingCurrencies(new Set(['USD']), campaigns)
    expect(result.defaultBlocked).toHaveLength(1)
    expect(result.defaultBlocked[0]!.campaignName).toBe('Standard')
  })

  it('skips campaigns without a form', () => {
    const cid = uniqueId('camp')
    const campaign = makeCampaign(cid, 'Camp', null)

    const result = findFormsUsingCurrencies(new Set(['GBP']), [campaign])
    expect(result.defaultBlocked).toEqual([])
    expect(result.enabledOnly).toEqual([])
  })

  it('skips forms without donationAmounts config', () => {
    const cid = uniqueId('camp')
    const form = makeForm('f1', 'No DA', makeConfig({ noDA: true }))
    const campaign = makeCampaign(cid, 'Camp', form)

    const result = findFormsUsingCurrencies(new Set(['GBP']), [campaign])
    expect(result.defaultBlocked).toEqual([])
    expect(result.enabledOnly).toEqual([])
  })

  it('handles multiple currencies removed simultaneously', () => {
    const cid1 = uniqueId('camp')
    const cid2 = uniqueId('camp')
    const campaigns = [
      makeCampaign(
        cid1,
        'Camp 1',
        makeForm(
          'f1',
          'Enabled Only',
          makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD', 'EUR'] })
        )
      ),
      makeCampaign(
        cid2,
        'Camp 2',
        makeForm(
          'f2',
          'Default USD',
          makeConfig({ baseDefaultCurrency: 'USD', enabledCurrencies: ['USD', 'EUR'] })
        )
      )
    ]

    const result = findFormsUsingCurrencies(new Set(['USD', 'EUR']), campaigns)
    expect(result.defaultBlocked).toHaveLength(1)
    expect(result.defaultBlocked[0]!.formName).toBe('Default USD')
    expect(result.enabledOnly).toHaveLength(1)
    expect(result.enabledOnly[0]!.formName).toBe('Enabled Only')
  })
})

describe('stripCurrenciesFromForms', () => {
  it('removes currency from enabledCurrencies', () => {
    const cid = uniqueId('camp')
    const form = makeForm(
      'f1',
      'Form',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD', 'EUR'] })
    )
    const campaigns = [makeCampaign(cid, 'Camp', form)]

    stripCurrenciesFromForms(['EUR'], [{ campaignId: cid }], campaigns)

    expect(campaigns[0]!.form!.config.donationAmounts!.enabledCurrencies).toEqual(['GBP', 'USD'])
  })

  it('does not touch baseDefaultCurrency', () => {
    const cid = uniqueId('camp')
    const form = makeForm(
      'f1',
      'Form',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: ['GBP', 'USD'] })
    )
    const campaigns = [makeCampaign(cid, 'Camp', form)]

    stripCurrenciesFromForms(['USD'], [{ campaignId: cid }], campaigns)

    expect(campaigns[0]!.form!.config.donationAmounts!.baseDefaultCurrency).toBe('GBP')
  })

  it('handles form with empty enabledCurrencies', () => {
    const cid = uniqueId('camp')
    const form = makeForm(
      'f1',
      'Form',
      makeConfig({ baseDefaultCurrency: 'GBP', enabledCurrencies: [] })
    )
    const campaigns = [makeCampaign(cid, 'Camp', form)]

    stripCurrenciesFromForms(['USD'], [{ campaignId: cid }], campaigns)

    expect(campaigns[0]!.form!.config.donationAmounts!.enabledCurrencies).toEqual([])
  })

  it('strips currencies from multiple campaigns', () => {
    const cid1 = uniqueId('camp')
    const cid2 = uniqueId('camp')
    const campaigns = [
      makeCampaign(
        cid1,
        'Camp 1',
        makeForm('f1', 'Form 1', makeConfig({ enabledCurrencies: ['GBP', 'USD'] }))
      ),
      makeCampaign(
        cid2,
        'Camp 2',
        makeForm('f2', 'Form 2', makeConfig({ enabledCurrencies: ['GBP', 'EUR'] }))
      )
    ]

    stripCurrenciesFromForms(
      ['USD', 'EUR'],
      [{ campaignId: cid1 }, { campaignId: cid2 }],
      campaigns
    )

    expect(campaigns[0]!.form!.config.donationAmounts!.enabledCurrencies).toEqual(['GBP'])
    expect(campaigns[1]!.form!.config.donationAmounts!.enabledCurrencies).toEqual(['GBP'])
  })
})
