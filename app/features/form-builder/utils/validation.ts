import type { z } from 'zod'
import type { FieldMeta, FieldContext } from '../types'
import { checkFieldVisibility } from '../composables/useFieldPath'

/**
 * Build nested field context with proper parent/root chain
 * Used when validating nested fields (field-groups, tabs, arrays)
 */
export function buildNestedContext(
  parentContext: FieldContext,
  nestedValues: Record<string, unknown>
): FieldContext {
  const rootValues = parentContext.root || {}
  return {
    ...parentContext,
    values: { ...rootValues, ...nestedValues },
    parent: parentContext.values,
    root: rootValues
  }
}

/**
 * Validate value against Zod schema, return first error message if any
 * Pure function for consistent error extraction across all validation contexts
 */
export function validateWithZod(rules: z.ZodTypeAny, value: unknown): string | undefined {
  try {
    const result = rules.safeParse(value)
    return result.success ? undefined : result.error.errors[0]?.message
  } catch {
    return undefined
  }
}

/**
 * Resolve field rules (function or static) to Zod schema
 * Handles both static schemas and dynamic schema functions
 */
export function resolveFieldRules(
  rules: FieldMeta['rules'] | undefined,
  fieldContext: FieldContext
): z.ZodTypeAny | undefined {
  if (!rules) return undefined
  return typeof rules === 'function' ? rules(fieldContext) : rules
}

/**
 * Recursively validate a single field and collect errors into the errors map.
 * Handles field-groups, tabs, and arrays by recursing appropriately.
 *
 * @param fieldMeta - Field metadata with rules
 * @param fieldValue - Current field value
 * @param fullPath - Full vee-validate path to this field
 * @param fieldContext - Context for dynamic rule evaluation
 * @param errors - Map to collect errors (mutated)
 */
export function validateField(
  fieldMeta: FieldMeta,
  fieldValue: unknown,
  fullPath: string,
  fieldContext: FieldContext,
  errors: Map<string, string>
): void {
  // Field-group: recurse into nested fields
  if (fieldMeta.type === 'field-group' && 'fields' in fieldMeta && fieldMeta.fields) {
    const nestedValues = (fieldValue as Record<string, unknown>) || {}
    const nestedContext = buildNestedContext(fieldContext, nestedValues)
    validateFields(fieldMeta.fields, nestedValues, fullPath, nestedContext, errors)
    return
  }

  // Tabs: recurse into each tab's fields
  if (fieldMeta.type === 'tabs' && 'tabs' in fieldMeta) {
    const tabsValue = (fieldValue as Record<string, unknown>) || {}
    for (const tab of fieldMeta.tabs) {
      const tabValues = (tabsValue[tab.value] as Record<string, unknown>) || {}
      const tabContext = buildNestedContext(fieldContext, tabValues)
      validateFields(tab.fields, tabValues, `${fullPath}.${tab.value}`, tabContext, errors)
    }
    return
  }

  // Arrays: validate each item + array itself
  if (fieldMeta.type === 'array' && 'itemField' in fieldMeta) {
    const arrayValue = Array.isArray(fieldValue) ? fieldValue : []

    for (let i = 0; i < arrayValue.length; i++) {
      const itemMeta =
        typeof fieldMeta.itemField === 'function'
          ? fieldMeta.itemField(fieldContext.values as Record<string, unknown>, {
              index: i,
              items: arrayValue as Record<string, unknown>[]
            })
          : fieldMeta.itemField

      const itemValue = arrayValue[i]
      const itemContext =
        typeof itemValue === 'object' && itemValue !== null
          ? buildNestedContext(fieldContext, itemValue as Record<string, unknown>)
          : fieldContext

      validateField(itemMeta, itemValue, `${fullPath}[${i}]`, itemContext, errors)
    }

    // Validate array-level rules
    const arrayRules = resolveFieldRules(fieldMeta.rules, fieldContext)
    if (arrayRules) {
      const message = validateWithZod(arrayRules, fieldValue)
      if (message) errors.set(fullPath, message)
    }
    return
  }

  // Scalar field: validate rules directly
  const rules = resolveFieldRules(fieldMeta.rules, fieldContext)
  if (rules) {
    const message = validateWithZod(rules, fieldValue)
    if (message) errors.set(fullPath, message)
  }
}

/**
 * Validate all visible fields in a field collection against their Zod schemas.
 * Recursively handles nested field-groups, tabs, and arrays.
 *
 * @param fields - Field metadata map
 * @param values - Current values object
 * @param pathPrefix - Path prefix for error keys
 * @param fieldContext - Context for visibility and rules
 * @param errors - Map to collect errors (optional, created if not provided)
 * @param parentVisible - Whether parent container is visible
 * @returns Map of error paths to error messages
 */
export function validateFields(
  fields: Record<string, FieldMeta>,
  values: Record<string, unknown>,
  pathPrefix: string,
  fieldContext: FieldContext,
  errors = new Map<string, string>(),
  parentVisible = true
): Map<string, string> {
  for (const [fieldKey, fieldMeta] of Object.entries(fields)) {
    const isVisible = checkFieldVisibility(fieldMeta, fieldContext, {
      parentVisible,
      skipContainerValidation: true // Validate collapsed containers
    })
    if (!isVisible) continue

    validateField(fieldMeta, values[fieldKey], `${pathPrefix}.${fieldKey}`, fieldContext, errors)
  }
  return errors
}
