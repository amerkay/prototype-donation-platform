/**
 * Shared utilities for condition builder UIs
 * Used by both custom-fields and filter condition builders
 */
import * as z from 'zod'
import type { FieldContext, OnChangeContext } from '~/features/_library/form-builder/types'
import { selectField } from '~/features/_library/form-builder/api'
import type { AvailableField } from '~/features/_library/form-builder/composables/useAvailableFields'
import type {
  ComparisonOperator,
  ContextSchema
} from '~/features/_library/form-builder/conditions/types'
import {
  OPERATOR_LABELS,
  operatorRequiresValue,
  getOperatorsForType
} from '~/features/_library/form-builder/conditions/operators'

/**
 * Build a human-readable label for a condition item
 */
export function buildDisplayLabel(
  selectedField: string | undefined,
  selectedOperator: ComparisonOperator | undefined,
  conditionValue: unknown,
  fieldMeta: AvailableField | undefined
): string {
  if (!selectedField) return 'New Condition'

  const fieldLabel = fieldMeta?.label || selectedField
  if (!selectedOperator) return fieldLabel

  const operatorLabel = OPERATOR_LABELS[selectedOperator]

  if (!operatorRequiresValue(selectedOperator)) {
    return `${fieldLabel} ${operatorLabel}`
  }

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
}

/**
 * Convert ContextSchema to AvailableField array
 */
export function contextSchemaToFields(
  schema: ContextSchema,
  defaultGroup = 'Fields'
): AvailableField[] {
  return Object.entries(schema).map(([key, field]) => ({
    key,
    label: field.label,
    type: field.type,
    options: field.options,
    group: field.group || defaultGroup
  }))
}

/**
 * Auto-select first operator and pre-fill value when a field is chosen
 */
export function autoSelectDefaults(
  setValue: (field: string, value: unknown) => void,
  fieldKey: string,
  allFields: AvailableField[]
) {
  const meta = allFields.find((f) => f.key === fieldKey)
  const ops = getFieldOperators(meta)
  const firstOp = ops[0]
  if (!firstOp) return

  // Set value BEFORE operator to avoid timing issues where array field
  // mounts before value is updated from string/number to array
  if ((firstOp === 'in' || firstOp === 'notIn') && meta?.options?.length) {
    setValue('value', [meta.options[0]!.value])
  } else if (firstOp === 'in' || firstOp === 'notIn') {
    setValue('value', [])
  } else {
    setValue('value', '')
  }
  setValue('operator', firstOp)
}

/**
 * Pre-fill value for enum fields when operator changes to in/notIn
 */
function prefillValueForOperator(
  op: ComparisonOperator,
  fieldKey: string | undefined,
  allFields: AvailableField[],
  setValue: (field: string, value: unknown) => void
) {
  if (op === 'in' || op === 'notIn') {
    const meta = fieldKey ? allFields.find((f) => f.key === fieldKey) : undefined
    setValue('value', meta?.options?.length ? [meta.options[0]!.value] : [])
  } else {
    setValue('value', '')
  }
}

/**
 * Build the operator select field with dynamic validation
 */
export function buildOperatorField(
  availableOperators: ComparisonOperator[],
  getOperatorsForCurrentField: (ctx: FieldContext) => ComparisonOperator[],
  allFields: AvailableField[]
) {
  return selectField('operator', {
    label: 'Condition',
    placeholder: 'Select condition',
    options: availableOperators.map((op) => ({
      value: op,
      label: OPERATOR_LABELS[op]
    })),
    rules: (ctx: FieldContext) => {
      const currentOperators = getOperatorsForCurrentField(ctx)
      return z.string().refine((val) => currentOperators.includes(val as ComparisonOperator), {
        message: 'Invalid operator'
      })
    },
    visibleWhen: (ctx: FieldContext) => !!(ctx.values as Record<string, unknown>).field,
    onChange: ({ value, setValue, values }: OnChangeContext) => {
      const op = value as ComparisonOperator
      const fieldKey = (values as Record<string, unknown>).field as string | undefined
      prefillValueForOperator(op, fieldKey, allFields, setValue)
    }
  })
}

/**
 * Compute operators for a field, adding in/notIn for fields with options
 */
export function getFieldOperators(fieldMeta: AvailableField | undefined): ComparisonOperator[] {
  if (!fieldMeta) return ['empty', 'notEmpty'] as ComparisonOperator[]

  // Enum fields with options: only in/notIn + empty/notEmpty
  if (fieldMeta.options) {
    return ['in', 'notIn', 'empty', 'notEmpty']
  }

  return getOperatorsForType(fieldMeta.type)
}
