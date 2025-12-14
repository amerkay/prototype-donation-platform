/**
 * Common field props interface for vee-validate field components
 */
export interface VeeFieldContext {
  value: unknown
  onChange: (value: unknown) => void
  onBlur?: () => void
  name: string
}
