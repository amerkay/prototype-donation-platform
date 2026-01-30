import type { CurrencySettings } from '~/features/settings/admin/types'

export const currencySettings: CurrencySettings = {
  supportedCurrencies: ['GBP', 'USD', 'EUR'],
  defaultCurrency: 'GBP',
  currencyMultipliers: {
    USD: 2.0,
    EUR: 1.0
  }
}
