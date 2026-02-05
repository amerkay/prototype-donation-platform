import type { CurrencySettings, CharitySettings } from '~/features/settings/admin/types'

export const currencySettings: CurrencySettings = {
  supportedCurrencies: ['GBP', 'USD', 'EUR'],
  defaultCurrency: 'GBP',
  currencyMultipliers: {
    USD: 2.0,
    EUR: 1.0
  }
}

export const charitySettings: CharitySettings = {
  slug: 'bosf',
  name: 'Borneo Orangutan Survival Foundation',
  registrationNumber: 'RCN123456',
  address: '123 Conservation Way, Palangka Raya, Central Kalimantan, Indonesia',
  website: 'https://orangutan.org',
  description:
    'We rescue, rehabilitate, and release orangutans while protecting their natural habitat through community engagement and sustainable forest management programs across Borneo and Sumatra.',
  currencyOverrides: {
    GBP: { enabled: false, name: '', registrationNumber: '', address: '' },
    USD: { enabled: false, name: '', registrationNumber: '', address: '' },
    EUR: { enabled: false, name: '', registrationNumber: '', address: '' }
  }
}
