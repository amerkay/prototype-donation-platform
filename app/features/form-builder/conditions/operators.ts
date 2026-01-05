/**
 * Operator implementations for condition evaluation
 * Each operator is a pure function that compares a field value against a condition value
 */

import type { ComparisonOperator } from './types'

/**
 * Operator function signature
 * Returns true if the condition is met, false otherwise
 */
export type OperatorFn = (fieldValue: unknown, conditionValue: unknown) => boolean

/**
 * Check if a value is empty
 * Empty: null, undefined, '', [], {}
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Safely convert value to number
 * Returns NaN if conversion fails
 */
function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return Number.NaN
}

/**
 * Safely convert value to string
 */
function toString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

/**
 * Registry of all supported comparison operators
 */
export const OPERATORS: Record<ComparisonOperator, OperatorFn> = {
  /**
   * Strict equality comparison
   */
  equals: (fieldValue, conditionValue) => {
    return fieldValue === conditionValue
  },

  /**
   * Strict inequality comparison
   */
  notEquals: (fieldValue, conditionValue) => {
    return fieldValue !== conditionValue
  },

  /**
   * Check if fieldValue contains conditionValue
   * Works on strings (substring) and arrays (includes)
   */
  contains: (fieldValue, conditionValue) => {
    if (typeof fieldValue === 'string' && typeof conditionValue === 'string') {
      return fieldValue.includes(conditionValue)
    }
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(conditionValue)
    }
    return false
  },

  /**
   * Check if fieldValue does NOT contain conditionValue
   */
  notContains: (fieldValue, conditionValue) => {
    return !OPERATORS.contains(fieldValue, conditionValue)
  },

  /**
   * Check if string starts with prefix
   */
  startsWith: (fieldValue, conditionValue) => {
    const str = toString(fieldValue)
    const prefix = toString(conditionValue)
    return str.startsWith(prefix)
  },

  /**
   * Check if string ends with suffix
   */
  endsWith: (fieldValue, conditionValue) => {
    const str = toString(fieldValue)
    const suffix = toString(conditionValue)
    return str.endsWith(suffix)
  },

  /**
   * Numeric greater than comparison
   */
  greaterThan: (fieldValue, conditionValue) => {
    const num1 = toNumber(fieldValue)
    const num2 = toNumber(conditionValue)
    if (Number.isNaN(num1) || Number.isNaN(num2)) return false
    return num1 > num2
  },

  /**
   * Numeric greater than or equal comparison
   */
  greaterOrEqual: (fieldValue, conditionValue) => {
    const num1 = toNumber(fieldValue)
    const num2 = toNumber(conditionValue)
    if (Number.isNaN(num1) || Number.isNaN(num2)) return false
    return num1 >= num2
  },

  /**
   * Numeric less than comparison
   */
  lessThan: (fieldValue, conditionValue) => {
    const num1 = toNumber(fieldValue)
    const num2 = toNumber(conditionValue)
    if (Number.isNaN(num1) || Number.isNaN(num2)) return false
    return num1 < num2
  },

  /**
   * Numeric less than or equal comparison
   */
  lessOrEqual: (fieldValue, conditionValue) => {
    const num1 = toNumber(fieldValue)
    const num2 = toNumber(conditionValue)
    if (Number.isNaN(num1) || Number.isNaN(num2)) return false
    return num1 <= num2
  },

  /**
   * Check if value is empty (null, undefined, '', [], {})
   */
  empty: (fieldValue) => {
    return isEmpty(fieldValue)
  },

  /**
   * Check if value is NOT empty
   */
  notEmpty: (fieldValue) => {
    return !isEmpty(fieldValue)
  },

  /**
   * Check if fieldValue is in array of allowed values
   * conditionValue should be an array
   */
  in: (fieldValue, conditionValue) => {
    if (!Array.isArray(conditionValue)) return false
    return conditionValue.includes(fieldValue)
  },

  /**
   * Check if fieldValue is NOT in array of allowed values
   */
  notIn: (fieldValue, conditionValue) => {
    return !OPERATORS.in(fieldValue, conditionValue)
  }
}

/**
 * Get available operators for a given field type
 * Used by ConditionBuilder to filter operator dropdown
 */
export function getOperatorsForType(
  fieldType: 'string' | 'number' | 'boolean' | 'array'
): ComparisonOperator[] {
  switch (fieldType) {
    case 'string':
      return [
        'equals',
        'notEquals',
        'contains',
        'notContains',
        'startsWith',
        'endsWith',
        'empty',
        'notEmpty',
        'in',
        'notIn'
      ]

    case 'number':
      return [
        'equals',
        'notEquals',
        'greaterThan',
        'greaterOrEqual',
        'lessThan',
        'lessOrEqual',
        'empty',
        'notEmpty',
        'in',
        'notIn'
      ]

    case 'boolean':
      return ['equals', 'notEquals', 'empty', 'notEmpty']

    case 'array':
      return ['contains', 'notContains', 'empty', 'notEmpty']

    default:
      return ['equals', 'notEquals', 'empty', 'notEmpty']
  }
}

/**
 * Check if operator requires a value input
 * Some operators like 'empty' and 'notEmpty' don't need a value
 */
export function operatorRequiresValue(operator: ComparisonOperator): boolean {
  return operator !== 'empty' && operator !== 'notEmpty'
}

/**
 * Human-readable labels for operators
 * Used in ConditionBuilder UI dropdowns
 */
export const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  equals: 'Equals',
  notEquals: 'Not Equals',
  contains: 'Contains',
  notContains: 'Does Not Contain',
  startsWith: 'Starts With',
  endsWith: 'Ends With',
  greaterThan: 'Greater Than',
  greaterOrEqual: 'Greater Than or Equal',
  lessThan: 'Less Than',
  lessOrEqual: 'Less Than or Equal',
  empty: 'Is Empty',
  notEmpty: 'Is Not Empty',
  in: 'Is One Of',
  notIn: 'Is Not One Of'
}
