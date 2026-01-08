/**
 * Condition field builder for custom fields configuration
 * Builds the dynamic condition UI based on available fields and operators
 */
import * as z from 'zod'
import type { FieldMeta, FieldContext, OnChangeContext } from '~/features/form-builder/types'
import type { AvailableField } from '~/features/form-builder/composables/useAvailableFields'
import type { ContextSchema, ComparisonOperator } from '~/features/form-builder/conditions'
import {
  COMPARISON_OPERATORS,
  getOperatorsForType,
  operatorRequiresValue,
  OPERATOR_LABELS
} from '~/features/form-builder/conditions'
import { createFieldReferenceSchema } from './validation-helpers'

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
): (conditionValues: Record<string, unknown>) => FieldMeta {
  return (conditionValues: Record<string, unknown>) => {
    const selectedField = conditionValues.field as string | undefined

    // Merge preceding custom fields + external context fields
    const allAvailableFields: AvailableField[] = [
      ...precedingFields,
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
      : (['equals', 'notEquals'] as ComparisonOperator[])

    // Build flattened field selector options
    const fieldOptions: Array<{ value: string; label: string }> = allAvailableFields.map((f) => ({
      value: f.key,
      label: f.label
    }))

    return {
      type: 'field-group',
      label: 'Condition',
      fields: {
        field: {
          type: 'select',
          label: 'Field',
          placeholder: 'Select a field',
          options: fieldOptions,
          // CRITICAL FIX: Dynamic validation that checks field still exists
          rules: createFieldReferenceSchema(allAvailableFields, 'field'),
          onChange: ({ setValue }: OnChangeContext) => {
            // Clear dependent fields when field changes
            setValue('operator', '')
            setValue('value', '')
          }
        },

        operator: {
          type: 'select',
          label: 'Condition',
          placeholder: 'Select condition',
          options: availableOperators.map((op) => ({
            value: op,
            label: OPERATOR_LABELS[op]
          })),
          rules: z.enum(COMPARISON_OPERATORS, {
            errorMap: () => ({ message: 'Invalid operator' })
          }),
          visibleWhen: () => !!selectedField,
          onChange: ({ value, setValue }: OnChangeContext) => {
            // Clear value when operator changes
            const op = value as ComparisonOperator
            if (op === 'in' || op === 'notIn') {
              setValue('value', [])
            } else {
              setValue('value', '')
            }
          }
        },

        // Dynamic value field - changes based on operator and field metadata
        value: buildValueField(conditionValues, fieldMeta, selectedField)
      }
    }
  }
}

/**
 * Build the value field based on selected operator and field type
 * Returns appropriate field configuration (select, text, number, array)
 */
function buildValueField(
  conditionValues: Record<string, unknown>,
  fieldMeta: AvailableField | undefined,
  selectedField: string | undefined
): FieldMeta {
  const currentOp = conditionValues.operator as ComparisonOperator | undefined

  // For 'in'/'notIn' operators, use array field
  if (currentOp === 'in' || currentOp === 'notIn') {
    // Ensure value is an array before rendering array field to avoid type mismatch errors during transition
    const currentValue = conditionValues.value
    if (!Array.isArray(currentValue)) {
      return {
        type: 'text',
        visibleWhen: () => false
      }
    }

    if (fieldMeta?.options) {
      // Array of selects for enum fields
      return {
        type: 'array' as const,
        label: 'Values',
        addButtonText: 'Add Value',
        rules: z.array(z.union([z.string(), z.number()])).min(1, 'At least one value is required'),
        itemField: {
          type: 'select' as const,
          placeholder: 'Select a value',
          options: fieldMeta.options.filter(
            (opt): opt is { value: string | number; label: string } =>
              typeof opt.value === 'string' || typeof opt.value === 'number'
          ),
          rules: z.union([z.string(), z.number()]).refine((val) => val !== '', {
            message: 'Value is required'
          })
        },
        visibleWhen: ({ values }: FieldContext) => {
          if (!selectedField) return false
          const op = values.operator as ComparisonOperator | undefined
          if (!op) return false
          return op === 'in' || op === 'notIn'
        }
      }
    } else {
      // Array of text/number inputs for non-enum fields
      return {
        type: 'array' as const,
        label: 'Values',
        addButtonText: 'Add Value',
        rules: z
          .array(fieldMeta?.type === 'number' ? z.number() : z.string().min(1))
          .min(1, 'At least one value is required'),
        itemField:
          fieldMeta?.type === 'number'
            ? {
                type: 'number' as const,
                placeholder: 'Enter value',
                rules: z.number({ message: 'Value is required' })
              }
            : {
                type: 'text' as const,
                placeholder: 'Enter value',
                rules: z.string().min(1, 'Value is required')
              },
        visibleWhen: ({ values }: FieldContext) => {
          if (!selectedField) return false
          const op = values.operator as ComparisonOperator | undefined
          if (!op) return false
          return op === 'in' || op === 'notIn'
        }
      }
    }
  }

  // For other operators, use single value field
  if (fieldMeta?.options) {
    // Select for enum fields
    return {
      type: 'select' as const,
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
        if (!selectedField) return false
        const op = values.operator as ComparisonOperator | undefined
        if (!op || op === 'in' || op === 'notIn') return false
        return operatorRequiresValue(op)
      }
    }
  } else if (fieldMeta?.type === 'number') {
    // Number input for numeric fields
    return {
      type: 'number' as const,
      label: 'Value',
      placeholder: 'Enter value',
      rules: z.number({ message: 'Value is required' }),
      visibleWhen: ({ values }: FieldContext) => {
        if (!selectedField) return false
        const op = values.operator as ComparisonOperator | undefined
        if (!op) return false
        return operatorRequiresValue(op)
      }
    }
  } else {
    // Text input for string/other fields
    return {
      type: 'text' as const,
      label: 'Value',
      placeholder: 'Enter value',
      rules: z.string().min(1, 'Value is required'),
      visibleWhen: ({ values }: FieldContext) => {
        if (!selectedField) return false
        const op = values.operator as ComparisonOperator | undefined
        if (!op) return false
        return operatorRequiresValue(op)
      }
    }
  }
}
