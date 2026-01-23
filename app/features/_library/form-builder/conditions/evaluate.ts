/**
 * Condition evaluation logic
 * Evaluates declarative conditions against form values and external context
 */

import type { Condition, ConditionGroup } from './types'
import { OPERATORS } from './operators'

/**
 * Recursively flatten nested field-group structures while preserving leaf field names
 * Extracts values from field-groups and nested objects to create a flat key-value map
 *
 * @example
 * flattenFieldGroups({ booleanFields: { isRecurring: true }, amount: 10 })
 * // { isRecurring: true, amount: 10 }
 */
function flattenFieldGroups(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  function flatten(current: unknown, prefix: string = '') {
    if (current == null || typeof current !== 'object') {
      return
    }

    // Handle arrays separately
    if (Array.isArray(current)) {
      if (prefix) {
        result[prefix] = current
      }
      return
    }

    // Process object properties
    for (const [key, value] of Object.entries(current)) {
      if (value != null && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects (field-groups)
        flatten(value, '')
      } else {
        // Store leaf values with their direct key (no prefix from field-groups)
        result[key] = value
      }
    }
  }

  flatten(obj)
  return result
}

/**
 * Get value at path using dot notation
 * Supports nested objects and arrays
 * First checks for literal key match before splitting by dots
 *
 * @example
 * getValueAtPath({ user: { name: 'John' } }, 'user.name') // 'John'
 * getValueAtPath({ items: [{ id: 1 }] }, 'items.0.id') // 1
 * getValueAtPath({ 'donation.amount': 10 }, 'donation.amount') // 10 (literal key)
 */
function getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
  if (!path) return obj

  // First, check if the path exists as a literal key (for flattened contexts)
  if (path in obj) {
    return obj[path]
  }

  // Otherwise, navigate nested structure using dot notation
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current == null) return undefined
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

/**
 * Evaluate a single condition against provided values
 *
 * @param condition - Condition to evaluate
 * @param values - Object containing form values and external context (merged)
 * @returns True if condition is met, false otherwise
 */
export function evaluateCondition(condition: Condition, values: Record<string, unknown>): boolean {
  // Flatten field-groups to make nested values accessible at root level
  const flatValues = flattenFieldGroups(values)

  // Get the field value to check
  const fieldValue = getValueAtPath(flatValues, condition.field)

  // Determine the comparison value (static or from another field)
  let comparisonValue: unknown
  if (condition.valueFromField) {
    comparisonValue = getValueAtPath(flatValues, condition.valueFromField)
  } else {
    comparisonValue = condition.value
  }

  // Look up operator function
  const operatorFn = OPERATORS[condition.operator]
  if (!operatorFn) {
    console.warn(`Unknown operator: ${condition.operator}`)
    return false
  }

  // Execute operator
  try {
    const result = operatorFn(fieldValue, comparisonValue)
    return result
  } catch (error) {
    console.error(`Error evaluating condition:`, condition, error)
    return false
  }
}

/**
 * Evaluate a condition group with logical matching
 *
 * @param group - Condition group to evaluate
 * @param values - Object containing form values and external context (merged)
 * @returns True if group conditions are met, false otherwise
 */
export function evaluateConditionGroup(
  group: ConditionGroup,
  values: Record<string, unknown>
): boolean {
  if (!group.conditions || group.conditions.length === 0) {
    // No conditions means always visible
    return true
  }

  // Evaluate all conditions
  const results = group.conditions.map((condition) => evaluateCondition(condition, values))

  // Apply match logic
  let finalResult: boolean
  switch (group.match) {
    case 'all':
      // Every condition must be true (AND)
      finalResult = results.every((result) => result === true)
      break

    case 'any':
      // At least one condition must be true (OR)
      finalResult = results.some((result) => result === true)
      break

    case 'none':
      // No condition can be true (NOT ANY)
      finalResult = !results.some((result) => result === true)
      break

    default:
      console.warn(`Unknown match type: ${group.match}`)
      finalResult = true
  }

  return finalResult
}
