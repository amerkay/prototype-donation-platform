/**
 * Contact consent (email opt-in) configuration types
 */

export interface ContactConsentSettings {
  enabled: boolean
  settings: {
    label: string
    description: string
  }
}
