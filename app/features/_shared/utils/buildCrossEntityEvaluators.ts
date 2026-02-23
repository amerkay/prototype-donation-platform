import type { ComparisonOperator } from '~/features/_library/form-builder/conditions/types'
import { OPERATORS } from '~/features/_library/form-builder/conditions/operators'

type Evaluator = (conditionValue: unknown, item: unknown, operator: ComparisonOperator) => boolean

/** Field mapping: schema key → getter that extracts the value from the related entity */
type FieldMap<T> = Record<string, (entity: T) => unknown>

/**
 * Build evaluators for a single related entity (e.g., donor from donorId).
 * Returns false if resolver returns null/undefined.
 */
export function buildSingleEntityEvaluators<TItem, TRelated>(
  resolve: (item: TItem) => TRelated | undefined,
  fields: FieldMap<TRelated>
): Record<string, Evaluator> {
  const evaluators: Record<string, Evaluator> = {}
  for (const [key, getter] of Object.entries(fields)) {
    evaluators[key] = (conditionValue, item, operator) => {
      const related = resolve(item as TItem)
      return related ? OPERATORS[operator](getter(related), conditionValue) : false
    }
  }
  return evaluators
}

/**
 * Build evaluators for a collection of related entities (e.g., donor's transactions).
 * Returns true if ANY entity in the collection matches (ANY-match semantics).
 */
export function buildCollectionEvaluators<TItem, TRelated>(
  resolve: (item: TItem) => TRelated[],
  fields: FieldMap<TRelated>
): Record<string, Evaluator> {
  const evaluators: Record<string, Evaluator> = {}
  for (const [key, getter] of Object.entries(fields)) {
    evaluators[key] = (conditionValue, item, operator) => {
      const collection = resolve(item as TItem)
      return collection.some((entity) => OPERATORS[operator](getter(entity), conditionValue))
    }
  }
  return evaluators
}
