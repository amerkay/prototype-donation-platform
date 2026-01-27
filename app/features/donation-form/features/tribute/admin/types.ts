/**
 * Tribute (gift/memorial dedication) configuration types
 */

export interface TributeSettings {
  enabled: boolean
  showForOnceFrequency: boolean
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
