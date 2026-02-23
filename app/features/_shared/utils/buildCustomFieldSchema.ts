import type {
  ContextSchema,
  ComparisonOperator
} from '~/features/_library/form-builder/conditions/types'
import { OPERATORS } from '~/features/_library/form-builder/conditions/operators'
import type { Transaction } from '~/features/donor-portal/types'

type Evaluator = (conditionValue: unknown, item: unknown, operator: ComparisonOperator) => boolean

/** Convert snake_case key to Title Case label */
function prettifyKey(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Scan transactions for custom field keys/values and return a ContextSchema
 * with one entry per unique key, grouped under "Custom Fields".
 */
export function buildCustomFieldSchema(
  transactions: Transaction[],
  group = 'Custom Fields'
): ContextSchema {
  const keyValues = new Map<string, Set<string>>()

  for (const t of transactions) {
    if (!t.customFields) continue
    for (const [key, value] of Object.entries(t.customFields)) {
      const set = keyValues.get(key) ?? new Set()
      if (value) set.add(value)
      keyValues.set(key, set)
    }
  }

  const schema: ContextSchema = {}
  for (const [key, values] of keyValues) {
    schema[`customFields.${key}`] = {
      label: prettifyKey(key),
      type: 'string',
      group,
      options: [...values].sort().map((v) => ({ value: v, label: prettifyKey(v) }))
    }
  }

  return schema
}

/**
 * Wrap evaluators with a Proxy that dynamically handles `customFields.*` lookups
 * using the provided transaction resolver for cross-entity traversal.
 * The proxy intercepts property access so evaluators don't need pre-registration per key.
 */
export function withCustomFieldEvaluators(
  baseEvaluators: Record<string, Evaluator>,
  getTransactions: (item: unknown) => Transaction[]
): Record<string, Evaluator> {
  return new Proxy(baseEvaluators, {
    get(target, prop: string) {
      if (prop in target) return target[prop]
      if (prop.startsWith('customFields.')) {
        const key = prop.slice('customFields.'.length)
        return (conditionValue: unknown, item: unknown, operator: ComparisonOperator) => {
          const txns = getTransactions(item)
          return txns.some((t) => OPERATORS[operator](t.customFields?.[key], conditionValue))
        }
      }
      return undefined
    },
    has(target, prop: string) {
      return prop in target || prop.startsWith('customFields.')
    }
  })
}
