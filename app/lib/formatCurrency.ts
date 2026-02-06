/**
 * Format a numeric amount as a currency string using Intl.NumberFormat.
 * Pure function safe for use in render functions, column defs, and composables.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'GBP',
  decimals: number = 2
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount)
}
