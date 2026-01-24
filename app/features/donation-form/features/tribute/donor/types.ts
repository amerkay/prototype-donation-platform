/**
 * Tribute runtime types (used by donor-facing components and forms)
 */

/**
 * Flattened tribute data structure that matches form field structure.
 * This allows direct usage with FormRenderer without transformation layer.
 */
export interface TributeData {
  type: 'none' | 'gift' | 'memorial'
  // Honoree name fields
  honoreeName?: {
    honoreeFirstName: string
    honoreeLastName: string
  }
  relationship?: string
  // eCard fields
  sendECard?: boolean
  sameAsHonoree?: boolean
  recipientName?: {
    recipientFirstName: string
    recipientLastName: string
  }
  recipientEmail?: string
  isIncludeMessage?: boolean
  message?: string
}
