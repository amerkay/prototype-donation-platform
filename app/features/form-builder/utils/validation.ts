import type { z } from 'zod'
import { unref, type ComputedRef } from 'vue'
import type { FieldDef, FieldContext } from '../types'
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
 * Resolve field rules (function or static or ComputedRef) to Zod schema
 * Handles static schemas, dynamic schema functions, and reactive ComputedRefs
 */
export function resolveFieldRules(
  rules:
    | z.ZodTypeAny
    | ComputedRef<z.ZodTypeAny>
    | ((ctx: FieldContext) => z.ZodTypeAny)
    | undefined,
  fieldContext: FieldContext
): z.ZodTypeAny | undefined {
  if (!rules) return undefined
  // Check if it's a ComputedRef
  if (typeof rules === 'object' && 'value' in rules) {
    return unref(rules)
  }
  return typeof rules === 'function' ? rules(fieldContext) : rules
}

/**
 * Recursively validate a single field and collect errors into the errors map.
 * Handles field-groups, tabs, and arrays by recursing appropriately.
 *
 * @param fieldDef - Field definition with rules
 * @param fieldValue - Current field value
 * @param fullPath - Full vee-validate path to this field
 * @param fieldContext - Context for dynamic rule evaluation
 * @param errors - Map to collect errors (mutated)
 */
export function validateField(
  fieldDef: FieldDef,
  fieldValue: unknown,
  fullPath: string,
  fieldContext: FieldContext,
  errors: Map<string, string>
): void {
  // Field-group: recurse into nested fields
  if (fieldDef.type === 'field-group' && 'fields' in fieldDef && fieldDef.fields) {
    const nestedValues = (fieldValue as Record<string, unknown>) || {}
    const nestedContext = buildNestedContext(fieldContext, nestedValues)
    validateFields(fieldDef.fields, nestedValues, fullPath, nestedContext, errors)
    return
  }

  // Tabs: recurse into each tab's fields
  if (fieldDef.type === 'tabs' && 'tabs' in fieldDef) {
    const tabsValue = (fieldValue as Record<string, unknown>) || {}
    for (const tab of fieldDef.tabs) {
      const tabValues = (tabsValue[tab.value] as Record<string, unknown>) || {}
      const tabContext = buildNestedContext(fieldContext, tabValues)
      validateFields(tab.fields, tabValues, `${fullPath}.${tab.value}`, tabContext, errors)
    }
    return
  }

  // Arrays: validate each item + array itself
  if (fieldDef.type === 'array' && 'itemField' in fieldDef) {
    const arrayValue = Array.isArray(fieldValue) ? fieldValue : []

    for (let i = 0; i < arrayValue.length; i++) {
      const itemValue = arrayValue[i]

      // Resolve itemField metadata - pass the ITEM's values, not parent context values
      // This ensures dynamic field builders like buildConditionItemField receive correct data
      const itemDef =
        typeof fieldDef.itemField === 'function'
          ? fieldDef.itemField(itemValue as Record<string, unknown>, {
              index: i,
              items: arrayValue as Record<string, unknown>[],
              root: fieldContext.root
            })
          : fieldDef.itemField

      const itemContext =
        typeof itemValue === 'object' && itemValue !== null
          ? buildNestedContext(fieldContext, itemValue as Record<string, unknown>)
          : fieldContext

      validateField(itemDef, itemValue, `${fullPath}[${i}]`, itemContext, errors)
    }

    // Validate array-level rules
    const arrayRules = resolveFieldRules(fieldDef.rules, fieldContext)
    if (arrayRules) {
      const message = validateWithZod(arrayRules, fieldValue)
      if (message) errors.set(fullPath, message)
    }
    return
  }

  // Scalar field: validate rules directly
  const rules = resolveFieldRules(fieldDef.rules, fieldContext)
  if (rules) {
    const message = validateWithZod(rules, fieldValue)
    if (message) errors.set(fullPath, message)
  }
}

/**
 * Validate all visible fields in a field collection against their Zod schemas.
 * Recursively handles nested field-groups, tabs, and arrays.
 *
 * @param fields - Field definition map
 * @param values - Current values object
 * @param pathPrefix - Path prefix for error keys
 * @param fieldContext - Context for visibility and rules
 * @param errors - Map to collect errors (optional, created if not provided)
 * @param parentVisible - Whether parent container is visible
 * @returns Map of error paths to error messages
 */
export function validateFields(
  fields: Record<string, FieldDef>,
  values: Record<string, unknown>,
  pathPrefix: string,
  fieldContext: FieldContext,
  errors = new Map<string, string>(),
  parentVisible = true
): Map<string, string> {
  for (const [fieldKey, fieldDef] of Object.entries(fields)) {
    const isVisible = checkFieldVisibility(fieldDef, fieldContext, {
      parentVisible,
      skipContainerValidation: true // Validate collapsed containers
    })
    if (!isVisible) continue

    validateField(fieldDef, values[fieldKey], `${pathPrefix}.${fieldKey}`, fieldContext, errors)
  }
  return errors
}
