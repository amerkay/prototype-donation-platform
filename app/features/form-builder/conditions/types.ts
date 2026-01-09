/**
 * Conditional rendering types for declarative visibility and options filtering
 * Provides a serializable alternative to function-based conditions
 */

/**
 * Valid comparison operators (const array)
 * Single source of truth - ComparisonOperator type is derived from this
 */
export const COMPARISON_OPERATORS = [
  // String/Array membership
  'contains',
  'notContains',
  // Numeric comparison
  'greaterOrEqual',
  'lessOrEqual',
  // Existence checks
  'empty',
  'notEmpty',
  // Boolean checks
  'isTrue',
  'isFalse',
  // Array membership
  'in',
  'notIn'
] as const

/**
 * Comparison operator type derived from COMPARISON_OPERATORS array
 * Ensures type and runtime values stay in sync
 */
export type ComparisonOperator = (typeof COMPARISON_OPERATORS)[number]

/**
 * Single condition definition
 * Compares a field value against a static value or another field's value
 */
export interface Condition {
  /** Path to the field to check (supports dot notation) */
  field: string

  /** Comparison operator to apply */
  operator: ComparisonOperator

  /** Static value to compare against (optional if using valueFromField) */
  value?: unknown

  /** Path to another field whose value to compare against (optional if using value) */
  valueFromField?: string
}

/**
 * Group of conditions with logical matching
 */
export interface ConditionGroup {
  /** Array of conditions to evaluate */
  conditions: Condition[]

  /** Logical matching strategy:
   * - 'all': Every condition must be true (AND)
   * - 'any': At least one condition must be true (OR)
   * - 'none': No condition can be true (NOT ANY)
   */
  match: 'all' | 'any' | 'none'
}

/**
 * Option for select/radio/checkbox fields with enum values
 */
export interface ContextFieldOption {
  /** Internal value */
  value: string | number | boolean

  /** Human-readable label */
  label: string
}

/**
 * Schema definition for a single external context field
 * Used by admin UI to show available fields in condition builder
 */
export interface ContextFieldSchema {
  /** Human-readable label for dropdown */
  label: string

  /** Field data type */
  type: 'string' | 'number' | 'boolean' | 'array'

  /** Predefined options for enum fields (optional) */
  options?: ContextFieldOption[]

  /** Optional help text */
  description?: string

  /** Step number when this field becomes available (optional, for multi-step forms) */
  availableFromStep?: number
}

/**
 * Schema describing all available external context fields
 * Maps field key to its schema definition
 */
export type ContextSchema = Record<string, ContextFieldSchema>

/**
 * Conditional options configuration for select/radio/checkbox fields
 */
export interface ConditionalOptions {
  /** Key in external context that holds the options array */
  source: string

  /** Optional filter conditions to apply to the options */
  filter?: ConditionGroup
}
