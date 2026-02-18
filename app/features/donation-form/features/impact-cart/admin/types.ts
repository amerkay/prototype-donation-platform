/**
 * Impact cart (multiple products) configuration types
 */

export interface ImpactCartSettings {
  enabled: boolean
  settings: {
    initialDisplay: number
    quantityRemaining?: Record<string, number>
  }
}
