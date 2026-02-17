import type { CharityAddress } from '~/features/settings/admin/types'

/**
 * Format a structured charity address into a display string.
 * Joins non-empty parts with newlines: address1, address2, city + region + postcode, country.
 */
export function formatCharityAddress(addr: CharityAddress, separator = ', '): string {
  const cityLine = [addr.city, addr.region, addr.postcode].filter(Boolean).join(', ')
  return [addr.address1, addr.address2, cityLine, addr.country].filter(Boolean).join(separator)
}
