export function useCurrency() {
  const currencySymbols: Record<string, string> = {
    USD: 'US$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'AU$',
    INR: '₹',
  }

  const getCurrencySymbol = (currencyCode: string): string => {
    return currencySymbols[currencyCode.toUpperCase()] || currencyCode
  }

  return {
    getCurrencySymbol,
  }
}
