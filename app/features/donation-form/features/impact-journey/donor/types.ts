/**
 * Impact Journey runtime types (used by donor-facing components)
 */

/**
 * Impact per amount - what each amount level provides
 * System automatically shows all items up to the donation amount
 */
export interface ImpactPerAmount {
  amount: number // Amount in base currency
  label: string // What this amount provides (e.g., "Fresh fruit weekly")
}
