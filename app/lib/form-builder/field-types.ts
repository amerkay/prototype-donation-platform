/**
 * Common field props interface for vee-validate field components
 */
export interface VeeFieldContext {
  value?: unknown
  onChange: (value: unknown) => void
  onBlur?: (e: Event) => void
  name: string
}
