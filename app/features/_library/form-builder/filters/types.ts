/**
 * Filter state types for condition-based filtering
 */
import type { ComparisonOperator } from '../conditions/types'

export interface FilterConditionValues {
  match: 'all' | 'any' | 'none'
  conditions: Array<{ field: string; operator: ComparisonOperator; value: unknown }>
}

export interface FilterStateOptions {
  /** Custom evaluators for fields with complex data access (e.g., nested arrays) */
  customEvaluators?: Record<
    string,
    (conditionValue: unknown, item: unknown, operator: ComparisonOperator) => boolean
  >
}
