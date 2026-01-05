/**
 * Condition evaluation logic
 * Evaluates declarative conditions against form values and external context
 */

import type { Condition, ConditionGroup } from './types'
import { OPERATORS } from './operators'

/**
 * Get value at path using dot notation
 * Supports nested objects and arrays
 *
 * @example
 * getValueAtPath({ user: { name: 'John' } }, 'user.name') // 'John'
 * getValueAtPath({ items: [{ id: 1 }] }, 'items.0.id') // 1
 */
function getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
  if (!path) return obj

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
  // Get the field value to check
  const fieldValue = getValueAtPath(values, condition.field)

  // Determine the comparison value (static or from another field)
  let comparisonValue: unknown
  if (condition.valueFromField) {
    comparisonValue = getValueAtPath(values, condition.valueFromField)
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
    return operatorFn(fieldValue, comparisonValue)
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
  switch (group.match) {
    case 'all':
      // Every condition must be true (AND)
      return results.every((result) => result === true)

    case 'any':
      // At least one condition must be true (OR)
      return results.some((result) => result === true)

    case 'none':
      // No condition can be true (NOT ANY)
      return !results.some((result) => result === true)

    default:
      console.warn(`Unknown match type: ${group.match}`)
      return true
  }
}
