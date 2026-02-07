/**
 * Admin Donor Types
 *
 * Aggregated donor records derived from transactions.
 */

export interface Donor {
  id: string
  email: string
  name: string
  totalDonated: number
  donationCount: number
  currency: string
  lastDonationDate: string
  giftAid: boolean
  isAnonymous: boolean
}
