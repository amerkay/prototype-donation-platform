/**
 * Product selector configuration types
 */

export interface ProductSelectorSettings {
  enabled: boolean
  config: {
    icon: string
    entity: {
      singular: string
      plural: string
    }
    action: {
      verb: string
      noun: string
    }
  }
}
