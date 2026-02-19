/**
 * Filter condition builder for admin filter UIs
 * Flat (non-collapsible) variant of condition builder
 */
import * as z from 'zod'
import type { FieldContext, FieldDef } from '~/features/_library/form-builder/types'
import { selectField, fieldGroup } from '~/features/_library/form-builder/api'
import type {
  ComparisonOperator,
  ContextSchema
} from '~/features/_library/form-builder/conditions/types'
import { buildValueField } from './build-value-field'
import {
  buildDisplayLabel,
  buildOperatorField,
  getFieldOperators,
  autoSelectDefaults,
  contextSchemaToFields
} from './condition-utils'

/**
 * Build a filter condition item field
 * Flat field-group (no collapsible accordion, no field reference validation)
 */
export function buildFilterConditionField(
  contextSchema: ContextSchema
): (conditionValues: Record<string, unknown>) => FieldDef {
  return (conditionValues: Record<string, unknown>) => {
    const selectedField = conditionValues.field as string | undefined
    const selectedOperator = conditionValues.operator as ComparisonOperator | undefined
    const conditionValue = conditionValues.value

    const allFields = contextSchemaToFields(contextSchema)
    const fieldMeta = allFields.find((f) => f.key === selectedField)
    const availableOperators = getFieldOperators(fieldMeta)

    const getOperatorsForCurrentField = (ctx: FieldContext): ComparisonOperator[] => {
      const currentField = (ctx.values as Record<string, unknown>).field as string | undefined
      const currentFieldMeta = allFields.find((f) => f.key === currentField)
      return getFieldOperators(currentFieldMeta)
    }

    // Build field options with group property for grouped dropdown
    const fieldOptions = allFields.map((f) => ({
      value: f.key,
      label: f.label,
      group: f.group
    }))

    const displayLabel = buildDisplayLabel(
      selectedField,
      selectedOperator,
      conditionValue,
      fieldMeta
    )

    return fieldGroup('', {
      label: displayLabel,
      fields: {
        field: selectField('field', {
          label: 'Field',
          placeholder: 'Select a field',
          options: fieldOptions,
          rules: z.string().min(1, 'Field is required'),
          onChange: ({ setValue, value: fieldKey }) => {
            autoSelectDefaults(setValue, fieldKey as string, allFields)
          }
        }),
        operator: buildOperatorField(availableOperators, getOperatorsForCurrentField, allFields),
        value: buildValueField(conditionValues, fieldMeta, availableOperators)
      }
    })
  }
}
