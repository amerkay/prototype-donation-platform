/**
 * Cover costs configuration types
 */

export interface CoverCostsSettings {
  enabled: boolean
  settings: {
    heading: string
    description: string
    defaultPercentage: number
  }
}
