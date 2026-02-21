/**
 * Base utilities for field factories
 * Shared helpers to keep field factories DRY
 */
export type { BaseFieldConfig } from '../types'

/**
 * Slugify a string to URL-friendly format
 * Converts to lowercase, replaces non-alphanumeric with underscores, trims underscores
 *
 * @param text - Text to slugify
 * @param maxLength - Maximum length (optional)
 * @returns Slugified string
 *
 * @example
 * slugify('Hello World!') // 'hello_world'
 * slugify('Company Name', 20) // 'company_name'
 */
export function slugify(text: string, maxLength?: number): string {
  let slug = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  if (maxLength !== undefined) {
    slug = slug.substring(0, maxLength)
  }

  return slug || 'field'
}

/**
 * Generate field ID from label (for auto-ID generation in admin)
 * Creates URL-friendly slugs
 */
// export function generateFieldId(type: string, label: string): string {
//   return `${type}_${slugify(label, 50)}`
// }

/**
 * Extract advancedSettings object from field config
 * All field factories store admin config in a nested advancedSettings field-group
 * This helper safely extracts it with proper typing
 */
export function getAdvancedSettings(config: Record<string, unknown>): Record<string, unknown> {
  return (config.advancedSettings as Record<string, unknown> | undefined) || {}
}

/**
 * Extract field value with fallback chain: config → advancedSettings → default
 * Reduces boilerplate in field factories for extracting optional values
 *
 * Overloads ensure proper typing:
 * - With default value: returns T (never undefined)
 * - Without default: returns T | undefined
 */
export function extractFieldValue<T>(
  config: Record<string, unknown>,
  key: string,
  defaultValue: T
): T
export function extractFieldValue<T>(
  config: Record<string, unknown>,
  key: string,
  defaultValue?: undefined
): T | undefined
export function extractFieldValue<T>(
  config: Record<string, unknown>,
  key: string,
  defaultValue?: T
): T | undefined {
  const advancedSettings = getAdvancedSettings(config)
  return (config[key] as T | undefined) ?? (advancedSettings[key] as T | undefined) ?? defaultValue
}
