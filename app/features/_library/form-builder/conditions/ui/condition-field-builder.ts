/**
 * Condition field builder for custom-fields configuration forms
 * Builds collapsible condition UI with field reference validation
 */
import type { FieldContext, FieldDef } from '~/features/_library/form-builder/types'
import { selectField, fieldGroup } from '~/features/_library/form-builder/api'
import type { AvailableField } from '~/features/_library/form-builder/composables/useAvailableFields'
import type {
  ContextSchema,
  ComparisonOperator
} from '~/features/_library/form-builder/conditions/types'
import { createFieldReferenceSchema } from './validation-helpers'
import {
  validateFields,
  buildNestedContext
} from '~/features/_library/form-builder/utils/validation'
import { buildValueField } from './build-value-field'
import {
  buildDisplayLabel,
  buildOperatorField,
  getFieldOperators,
  autoSelectDefaults,
  contextSchemaToFields
} from './condition-utils'

/**
 * Build the condition item field for custom-fields config
 * Collapsible accordion with field reference validation
 */
export function buildConditionItemField(
  precedingFields: AvailableField[],
  contextSchema?: ContextSchema
): (conditionValues: Record<string, unknown>) => FieldDef {
  return (conditionValues: Record<string, unknown>) => {
    const selectedField = conditionValues.field as string | undefined
    const selectedOperator = conditionValues.operator as ComparisonOperator | undefined
    const conditionValue = conditionValues.value

    // Merge preceding custom fields + external context fields
    const allAvailableFields: AvailableField[] = [
      ...precedingFields.map((f) => ({ ...f, label: `${f.label} (Custom)` })),
      ...(contextSchema ? contextSchemaToFields(contextSchema, 'External Context') : [])
    ]

    const fieldMeta = allAvailableFields.find((f) => f.key === selectedField)
    const availableOperators = getFieldOperators(fieldMeta)

    // Helper to compute operators for current field (DRY)
    const getOperatorsForCurrentField = (ctx: FieldContext): ComparisonOperator[] => {
      const currentField = (ctx.values as Record<string, unknown>).field as string | undefined
      const currentFieldMeta = allAvailableFields.find((f) => f.key === currentField)
      return getFieldOperators(currentFieldMeta)
    }

    const conditionFields: Record<string, FieldDef> = {
      field: selectField('field', {
        label: 'Field',
        placeholder: 'Select a field',
        options: allAvailableFields.map((f) => ({ value: f.key, label: f.label })),
        rules: createFieldReferenceSchema(allAvailableFields, 'field'),
        onChange: ({ setValue, value: fieldKey }) => {
          autoSelectDefaults(setValue, fieldKey as string, allAvailableFields)
        }
      }),
      operator: buildOperatorField(
        availableOperators,
        getOperatorsForCurrentField,
        allAvailableFields
      ),
      value: buildValueField(conditionValues, fieldMeta, availableOperators)
    }

    const displayLabel = buildDisplayLabel(
      selectedField,
      selectedOperator,
      conditionValue,
      fieldMeta
    )

    // Check if condition has validation errors (for auto-open)
    const hasValidationErrors = (ctx: FieldContext): boolean => {
      const values = ctx.values as Record<string, unknown>
      if (!values.field || !values.operator) return true

      const errors = validateFields(
        conditionFields,
        values,
        'condition',
        buildNestedContext(ctx, values)
      )
      return errors.size > 0
    }

    return fieldGroup('', {
      label: displayLabel,
      collapsible: true,
      collapsibleDefaultOpen: hasValidationErrors,
      fields: conditionFields
    })
  }
}
