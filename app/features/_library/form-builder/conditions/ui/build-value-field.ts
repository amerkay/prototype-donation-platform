/**
 * Shared value field builder for condition UIs
 * Used by both custom-fields condition builder and filter condition builder
 */
import * as z from 'zod'
import type { FieldContext, FieldDef } from '~/features/_library/form-builder/types'
import {
  textField,
  numberField,
  arrayField,
  comboboxField
} from '~/features/_library/form-builder/api'
import type { AvailableField } from '~/features/_library/form-builder/composables/useAvailableFields'
import type { ComparisonOperator } from '~/features/_library/form-builder/conditions/types'
import { operatorRequiresValue } from '~/features/_library/form-builder/conditions/operators'

/**
 * Create a visibleWhen callback that checks field + operator validity before applying a predicate
 */
function makeValueVisibility(
  isOperatorValid: (op: ComparisonOperator | undefined) => op is ComparisonOperator,
  predicate: (op: ComparisonOperator) => boolean
) {
  return ({ values }: FieldContext) => {
    const field = (values as Record<string, unknown>).field as string | undefined
    if (!field) return false
    const op = values.operator as ComparisonOperator | undefined
    if (!isOperatorValid(op)) return false
    return predicate(op)
  }
}

/**
 * Build the value field based on selected operator and field type
 * Returns appropriate field configuration (select, text, number, array)
 */
export function buildValueField(
  conditionValues: Record<string, unknown>,
  fieldMeta: AvailableField | undefined,
  availableOperators: ComparisonOperator[]
): FieldDef {
  const currentOp = conditionValues.operator as ComparisonOperator | undefined

  // Common visibility check that ensures operator is valid for the current field
  const isOperatorValid = (op: ComparisonOperator | undefined): op is ComparisonOperator => {
    return !!op && availableOperators.includes(op)
  }

  const isInOrNotIn = (op: ComparisonOperator) => op === 'in' || op === 'notIn'
  const isValueRequired = (op: ComparisonOperator) => operatorRequiresValue(op)
  const isValueRequiredNonArray = (op: ComparisonOperator) =>
    !isInOrNotIn(op) && operatorRequiresValue(op)

  // Filter options to string|number values (used by enum fields)
  const validOptions = fieldMeta?.options?.filter(
    (opt): opt is { value: string | number; label: string } =>
      typeof opt.value === 'string' || typeof opt.value === 'number'
  )

  // For 'in'/'notIn' operators, use array field
  if (currentOp === 'in' || currentOp === 'notIn') {
    // Ensure value is an array before rendering array field to avoid type mismatch errors during transition
    const currentValue = conditionValues.value
    if (!Array.isArray(currentValue)) {
      return textField('value', {
        visibleWhen: () => false
      })
    }

    if (validOptions) {
      return comboboxField('value', {
        label: 'Values',
        multiple: true,
        options: validOptions,
        searchPlaceholder: 'Search...',
        rules: z.array(z.union([z.string(), z.number()])).min(1, 'At least one value is required'),
        visibleWhen: makeValueVisibility(isOperatorValid, isInOrNotIn)
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
        visibleWhen: makeValueVisibility(isOperatorValid, isInOrNotIn)
      })
    }
  }

  // For other operators, use single value field
  if (validOptions) {
    return comboboxField('value', {
      label: 'Value',
      options: validOptions,
      searchPlaceholder: 'Search...',
      rules: z.union([z.string(), z.number()]).refine((val) => val !== '', {
        message: 'Value is required'
      }),
      visibleWhen: makeValueVisibility(isOperatorValid, isValueRequiredNonArray)
    })
  } else if (fieldMeta?.type === 'number') {
    // Number input for numeric fields
    return numberField('value', {
      label: 'Value',
      placeholder: 'Enter value',
      rules: z.number({ message: 'Value is required' }),
      visibleWhen: makeValueVisibility(isOperatorValid, isValueRequired)
    })
  } else {
    // Text input for string/other fields
    return textField('value', {
      label: 'Value',
      placeholder: 'Enter value',
      rules: z.string().min(1, 'Value is required'),
      visibleWhen: makeValueVisibility(isOperatorValid, isValueRequired)
    })
  }
}
