/**
 * Build a filter form using the condition builder pattern
 */
import { toValue, type MaybeRefOrGetter } from 'vue'
import { defineForm, radioGroupField, arrayField } from '~/features/_library/form-builder/api'
import type { FieldContext } from '~/features/_library/form-builder/types'
import type { ContextSchema } from '~/features/_library/form-builder/conditions/types'
import { buildFilterConditionField } from './filter-condition-builder'

/**
 * Build a condition-based filter form
 * Returns a ComposableForm with match mode + dynamic conditions array
 */
export function buildFilterForm(formId: string, contextSchema: MaybeRefOrGetter<ContextSchema>) {
  return defineForm(formId, () => {
    const match = radioGroupField('match', {
      label: 'Match',
      options: [
        { value: 'all', label: 'All' },
        { value: 'any', label: 'Any' },
        { value: 'none', label: 'None' }
      ],
      defaultValue: 'all',
      orientation: 'horizontal',
      visibleWhen: (ctx: FieldContext) => {
        const conditions = (ctx.values as Record<string, unknown>).conditions
        return Array.isArray(conditions) && conditions.length > 1
      }
    })

    const conditions = arrayField('conditions', {
      label: 'Conditions',
      addButtonText: 'Add Condition',
      itemField: buildFilterConditionField(toValue(contextSchema))
    })

    return { match, conditions }
  })
}
