/**
 * Condition field builder for custom fields configuration
 * Builds the dynamic condition UI based on available fields and operators
 */
import * as z from 'zod'
import type {
  FieldContext,
  OnChangeContext,
  FieldDef
} from '~/features/_library/form-builder/types'
import {
  textField,
  selectField,
  numberField,
  arrayField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import type { AvailableField } from '~/features/_library/form-builder/composables/useAvailableFields'
import type { ContextSchema, ComparisonOperator } from '~/features/_library/form-builder/conditions'
import {
  getOperatorsForType,
  operatorRequiresValue,
  OPERATOR_LABELS
} from '~/features/_library/form-builder/conditions'
import { createFieldReferenceSchema } from './validation-helpers'
import {
  validateFields,
  buildNestedContext
} from '~/features/_library/form-builder/utils/validation'

/**
 * Build the condition item field configuration
 * Creates a dynamic field-group that changes based on selected field and operator
 *
 * @param precedingFields - Custom fields that come before current field
 * @param contextSchema - External context schema (optional)
 * @returns Field metadata for condition item
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
      // Add external context fields if available
      ...(contextSchema
        ? Object.entries(contextSchema).map(([key, schema]) => ({
            key,
            label: schema.label,
            type: schema.type,
            options: schema.options,
            group: 'External Context' as const
          }))
        : [])
    ]

    // Find the field metadata for operator filtering and value input
    const fieldMeta = allAvailableFields.find((f) => f.key === selectedField)
    const availableOperators = fieldMeta
      ? getOperatorsForType(fieldMeta.type)
      : (['empty', 'notEmpty'] as ComparisonOperator[])

    // Build flattened field selector options
    const fieldOptions: Array<{ value: string; label: string }> = allAvailableFields.map((f) => ({
      value: f.key,
      label: f.label
    }))

    // Generate meaningful trigger label
    const displayLabel = (() => {
      if (!selectedField) return 'New Condition'

      const fieldLabel = fieldMeta?.label || selectedField
      if (!selectedOperator) return fieldLabel

      const operatorLabel = OPERATOR_LABELS[selectedOperator]

      // For operators that don't require a value
      if (!operatorRequiresValue(selectedOperator)) {
        return `${fieldLabel} ${operatorLabel}`
      }

      // Format the value for display
      const formatValue = (val: unknown): string => {
        if (val === null || val === undefined || val === '') return '...'
        if (Array.isArray(val)) {
          if (val.length === 0) return '...'
          return val.length === 1 ? String(val[0]) : `${val[0]} +${val.length - 1}`
        }
        const valStr = String(val)
        return valStr.length > 20 ? valStr.substring(0, 20) + '...' : valStr
      }

      return `${fieldLabel} ${operatorLabel} ${formatValue(conditionValue)}`
    })()

    // Helper to compute operators for current field (DRY)
    const getOperatorsForCurrentField = (ctx: FieldContext): ComparisonOperator[] => {
      const currentField = (ctx.values as Record<string, unknown>).field as string | undefined
      const currentFieldMeta = allAvailableFields.find((f) => f.key === currentField)
      return currentFieldMeta
        ? getOperatorsForType(currentFieldMeta.type)
        : (['empty', 'notEmpty'] as ComparisonOperator[])
    }

    // Build the fields definition first
    const conditionFields: Record<string, FieldDef> = {
      field: selectField('field', {
        label: 'Field',
        placeholder: 'Select a field',
        options: fieldOptions,
        rules: createFieldReferenceSchema(allAvailableFields, 'field'),
        onChange: ({ setValue }: OnChangeContext) => {
          // Clear dependent fields when field changes
          setValue('operator', '')
          setValue('value', '')
        }
      }),

      operator: selectField('operator', {
        label: 'Condition',
        placeholder: 'Select condition',
        // Use current snapshot of operators (gets recomputed when builder reruns)
        options: availableOperators.map((op) => ({
          value: op,
          label: OPERATOR_LABELS[op]
        })),
        // Dynamic validation recomputes operators to avoid stale closure
        rules: (ctx: FieldContext) => {
          const currentOperators = getOperatorsForCurrentField(ctx)
          return z.string().refine((val) => currentOperators.includes(val as ComparisonOperator), {
            message: 'Invalid operator'
          })
        },
        visibleWhen: (ctx: FieldContext) => !!(ctx.values as Record<string, unknown>).field,
        onChange: ({ value, setValue }: OnChangeContext) => {
          // Clear value when operator changes
          const op = value as ComparisonOperator
          if (op === 'in' || op === 'notIn') {
            setValue('value', [])
          } else {
            setValue('value', '')
          }
        }
      }),

      // Dynamic value field - changes based on operator and field metadata
      value: buildValueField(conditionValues, fieldMeta, availableOperators)
    }

    // Use existing validation infrastructure to check if condition has errors
    // This is DRY - reuses the same Zod schemas defined in field rules
    const hasValidationErrors = (ctx: FieldContext): boolean => {
      const values = ctx.values as Record<string, unknown>

      // Quick check: if required fields are empty, it's incomplete (open it)
      if (!values.field || !values.operator) return true

      // Run actual validation using existing validateFields utility
      // This checks all field rules (field existence, operator validity, value type, etc.)
      const errors = validateFields(
        conditionFields,
        values,
        'condition', // Dummy path prefix
        buildNestedContext(ctx, values)
      )

      // If there are any validation errors, keep accordion open
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

/**
 * Build the value field based on selected operator and field type
 * Returns appropriate field configuration (select, text, number, array)
 */
function buildValueField(
  conditionValues: Record<string, unknown>,
  fieldMeta: AvailableField | undefined,
  availableOperators: ComparisonOperator[]
): FieldDef {
  const currentOp = conditionValues.operator as ComparisonOperator | undefined

  // Common visibility check that ensures operator is valid for the current field
  const isOperatorValid = (op: ComparisonOperator | undefined): op is ComparisonOperator => {
    return !!op && availableOperators.includes(op)
  }

  // For 'in'/'notIn' operators, use array field
  if (currentOp === 'in' || currentOp === 'notIn') {
    // Ensure value is an array before rendering array field to avoid type mismatch errors during transition
    const currentValue = conditionValues.value
    if (!Array.isArray(currentValue)) {
      return textField('value', {
        visibleWhen: () => false
      })
    }

    if (fieldMeta?.options) {
      // Array of selects for enum fields
      return arrayField('value', {
        label: 'Values',
        addButtonText: 'Add Value',
        rules: z.array(z.union([z.string(), z.number()])).min(1, 'At least one value is required'),
        itemField: selectField('', {
          placeholder: 'Select a value',
          options: fieldMeta.options.filter(
            (opt): opt is { value: string | number; label: string } =>
              typeof opt.value === 'string' || typeof opt.value === 'number'
          ),
          rules: z.union([z.string(), z.number()]).refine((val) => val !== '', {
            message: 'Value is required'
          })
        }),
        visibleWhen: ({ values }: FieldContext) => {
          const field = (values as Record<string, unknown>).field as string | undefined
          if (!field) return false
          const op = values.operator as ComparisonOperator | undefined
          if (!isOperatorValid(op)) return false
          return op === 'in' || op === 'notIn'
        }
      })
    } else {
      // Array of text/number inputs for non-enum fields
      return arrayField('value', {
        label: 'Values',
        addButtonText: 'Add Value',
        rules: z
          .array(fieldMeta?.type === 'number' ? z.number() : z.string().min(1))
          .min(1, 'At least one value is required'),
        itemField:
          fieldMeta?.type === 'number'
            ? numberField('', {
                placeholder: 'Enter value',
                rules: z.number({ message: 'Value is required' })
              })
            : textField('', {
                placeholder: 'Enter value',
                rules: z.string().min(1, 'Value is required')
              }),
        visibleWhen: ({ values }: FieldContext) => {
          const field = (values as Record<string, unknown>).field as string | undefined
          if (!field) return false
          const op = values.operator as ComparisonOperator | undefined
          if (!isOperatorValid(op)) return false
          return op === 'in' || op === 'notIn'
        }
      })
    }
  }

  // For other operators, use single value field
  if (fieldMeta?.options) {
    // Select for enum fields
    return selectField('value', {
      label: 'Value',
      placeholder: 'Select a value',
      options: fieldMeta.options.filter(
        (opt): opt is { value: string | number; label: string } =>
          typeof opt.value === 'string' || typeof opt.value === 'number'
      ),
      rules: z.union([z.string(), z.number()]).refine((val) => val !== '', {
        message: 'Value is required'
      }),
      visibleWhen: ({ values }: FieldContext) => {
        const field = (values as Record<string, unknown>).field as string | undefined
        if (!field) return false
        const op = values.operator as ComparisonOperator | undefined
        if (!isOperatorValid(op) || op === 'in' || op === 'notIn') return false
        return operatorRequiresValue(op)
      }
    })
  } else if (fieldMeta?.type === 'number') {
    // Number input for numeric fields
    return numberField('value', {
      label: 'Value',
      placeholder: 'Enter value',
      rules: z.number({ message: 'Value is required' }),
      visibleWhen: ({ values }: FieldContext) => {
        const field = (values as Record<string, unknown>).field as string | undefined
        if (!field) return false
        const op = values.operator as ComparisonOperator | undefined
        if (!isOperatorValid(op)) return false
        return operatorRequiresValue(op)
      }
    })
  } else {
    // Text input for string/other fields
    return textField('value', {
      label: 'Value',
      placeholder: 'Enter value',
      rules: z.string().min(1, 'Value is required'),
      visibleWhen: ({ values }: FieldContext) => {
        const field = (values as Record<string, unknown>).field as string | undefined
        if (!field) return false
        const op = values.operator as ComparisonOperator | undefined
        if (!isOperatorValid(op)) return false
        return operatorRequiresValue(op)
      }
    })
  }
}
