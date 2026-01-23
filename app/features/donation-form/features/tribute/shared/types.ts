/**
 * Tribute (gift/memorial dedication) configuration types
 */

export interface TributeSettings {
  enabled: boolean
  icons: {
    gift: string
    memorial: string
    tribute: string
  }
  types: {
    none: {
      label: string
    }
    giftEnabled: boolean
    memorialEnabled: boolean
  }
  relationships: ReadonlyArray<{
    value: string
    label: string
  }>
  modal: {
    title: string
    subtitle: string
  }
}

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
