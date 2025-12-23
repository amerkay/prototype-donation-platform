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

export interface TributeData {
  type: 'none' | 'gift' | 'memorial'
  honoree?: {
    firstName: string
    lastName: string
    relationship: string
  }
  eCard?: {
    send: boolean
    recipient?: {
      firstName: string
      lastName: string
      email: string
    }
    isIncludeMessage?: boolean
    message?: string
  }
}
