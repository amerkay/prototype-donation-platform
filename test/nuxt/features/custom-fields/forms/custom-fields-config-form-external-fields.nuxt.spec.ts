import { describe, expect, it } from 'vitest'
import { createCustomFieldsConfigSection } from '~/features/custom-fields/forms/custom-fields-config-form'
import type {
  ArrayFieldMeta,
  FieldGroupMeta,
  ArrayItemContext,
  FieldMeta
} from '~/features/form-builder/types'
import type { ContextSchema } from '~/features/form-builder/conditions'

describe('custom-fields-config-form - External Fields Resolution', () => {
  /**
   * Helper to extract condition field options from config
   * Tests the available fields that can be used in visibility conditions
   */
  function getConditionFieldOptions(
    config: ArrayFieldMeta,
    itemValues: Record<string, unknown>,
    context: ArrayItemContext
  ): Array<{ value: string; label: string }> {
    const itemFieldFn = config.itemField as (v: unknown, c: ArrayItemContext) => FieldGroupMeta
    const newItem = itemFieldFn(itemValues, context)

    // Navigate to condition field options
    // This tests the public API of what fields are available for conditions
    const conditionGroup = newItem.fields?.visibilityConditions as FieldGroupMeta | undefined
    if (!conditionGroup) throw new Error('visibilityConditions not found')

    const visibleWhen = conditionGroup?.fields?.visibleWhen as FieldGroupMeta | undefined
    if (!visibleWhen) throw new Error('visibleWhen not found')

    const conditionsArray = visibleWhen?.fields?.conditions as ArrayFieldMeta | undefined
    if (!conditionsArray) throw new Error('conditions array not found')

    const conditionItemFn = conditionsArray?.itemField as
      | ((v: unknown) => FieldGroupMeta)
      | undefined
    if (!conditionItemFn) throw new Error('condition itemField not found')

    const conditionItem = conditionItemFn({})
    const fieldSelector = conditionItem.fields?.field as FieldMeta | undefined
    if (!fieldSelector) throw new Error('field selector not found')

    return (fieldSelector as FieldMeta & { options: unknown }).options as Array<{
      value: string
      label: string
    }>
  }

  describe('resolveExternalFields callback', () => {
    it('calls resolveExternalFields with root context', () => {
      let capturedRoot: Record<string, unknown> | undefined

      const resolver = (root: Record<string, unknown>) => {
        capturedRoot = root
        return []
      }

      const config = createCustomFieldsConfigSection(undefined, resolver)
      const fieldsArray = config.fields.fields as ArrayFieldMeta

      const rootValues = { someData: 'test', otherField: 42 }

      // Trigger itemField function which should invoke resolver
      const itemFieldFn = fieldsArray.itemField as (
        v: unknown,
        c: ArrayItemContext
      ) => FieldGroupMeta
      itemFieldFn({ type: 'text', label: 'Test Field' }, { index: 0, items: [], root: rootValues })

      // Resolver should have been called with root context
      expect(capturedRoot).toBeDefined()
      expect(capturedRoot).toEqual(rootValues)
    })

    it('makes external fields available for conditions alongside preceding fields', () => {
      const resolver = (root: Record<string, unknown>) => {
        // Simulate extracting fields from another part of the form
        const externalData = root.externalSection as Record<string, unknown> | undefined
        if (externalData && Array.isArray(externalData.fields) && externalData.fields.length > 0) {
          return [
            {
              key: 'external_field_1',
              label: 'External Field 1',
              type: 'string' as const,
              group: 'Form Fields' as const
            }
          ]
        }
        return []
      }

      const config = createCustomFieldsConfigSection(undefined, resolver)
      const fieldsArray = config.fields.fields as ArrayFieldMeta

      // Mock current array items (preceding fields)
      const precedingField = { id: 'field_a', type: 'text', label: 'Preceding Field' }

      // Mock root with external data
      const rootValues = {
        externalSection: {
          fields: [{ id: 'external_field_1', type: 'text', label: 'External Field 1' }]
        }
      }

      const options = getConditionFieldOptions(
        fieldsArray,
        { type: 'text', label: 'Current Field' },
        { index: 1, items: [precedingField], root: rootValues }
      )

      // Should include both preceding field and external field
      expect(options.find((o) => o.value === 'field_a')).toBeDefined()
      expect(options.find((o) => o.value === 'external_field_1')).toBeDefined()
    })

    it('orders external fields before custom fields in condition options', () => {
      const resolver = () => [
        {
          key: 'external_1',
          label: 'External 1',
          type: 'string' as const,
          group: 'Form Fields' as const
        }
      ]

      const config = createCustomFieldsConfigSection(undefined, resolver)
      const fieldsArray = config.fields.fields as ArrayFieldMeta

      const precedingField = { id: 'field_a', type: 'text', label: 'Preceding Field' }

      const options = getConditionFieldOptions(
        fieldsArray,
        { type: 'text', label: 'Current' },
        { index: 1, items: [precedingField], root: {} }
      )

      const external1Index = options.findIndex((o) => o.value === 'external_1')
      const fieldAIndex = options.findIndex((o) => o.value === 'field_a')

      // External field should come before preceding field
      expect(external1Index).toBeLessThan(fieldAIndex)
    })

    it('handles resolver returning empty array gracefully', () => {
      const resolver = () => []

      const config = createCustomFieldsConfigSection(undefined, resolver)
      const fieldsArray = config.fields.fields as ArrayFieldMeta

      const precedingField = { id: 'field_a', type: 'text', label: 'Field A' }

      const options = getConditionFieldOptions(
        fieldsArray,
        { type: 'text', label: 'Current' },
        { index: 1, items: [precedingField], root: {} }
      )

      // Should still have preceding field
      expect(options.find((o) => o.value === 'field_a')).toBeDefined()
    })
  })

  describe('Label suffixes for field types', () => {
    it('appends (Custom) to resolved external field labels', () => {
      const resolver = () => [
        {
          key: 'external_1',
          label: 'External Question',
          type: 'string' as const,
          group: 'Form Fields' as const
        }
      ]

      const config = createCustomFieldsConfigSection(undefined, resolver)
      const fieldsArray = config.fields.fields as ArrayFieldMeta

      const options = getConditionFieldOptions(
        fieldsArray,
        { type: 'text', label: 'Current' },
        { index: 0, items: [], root: {} }
      )

      const externalOption = options.find((o) => o.value === 'external_1')
      expect(externalOption?.label).toBe('External Question (Custom)')
    })

    it('appends (Custom) to preceding custom field labels', () => {
      const config = createCustomFieldsConfigSection()
      const fieldsArray = config.fields.fields as ArrayFieldMeta

      const precedingField = { id: 'field_a', type: 'text', label: 'Preceding Question' }

      const options = getConditionFieldOptions(
        fieldsArray,
        { type: 'text', label: 'Current' },
        { index: 1, items: [precedingField], root: {} }
      )

      const precedingOption = options.find((o) => o.value === 'field_a')
      expect(precedingOption?.label).toBe('Preceding Question (Custom)')
    })

    it('does NOT append (Custom) to external context schema fields', () => {
      const contextSchema: ContextSchema = {
        donorTier: {
          label: 'Donor Tier',
          type: 'string',
          options: [
            { value: 'bronze', label: 'Bronze' },
            { value: 'silver', label: 'Silver' }
          ]
        }
      }

      const config = createCustomFieldsConfigSection(contextSchema)
      const fieldsArray = config.fields.fields as ArrayFieldMeta

      const options = getConditionFieldOptions(
        fieldsArray,
        { type: 'text', label: 'Current' },
        { index: 0, items: [], root: {} }
      )

      const contextOption = options.find((o) => o.value === 'donorTier')
      expect(contextOption?.label).toBe('Donor Tier')
      expect(contextOption?.label).not.toContain('(Custom)')
    })

    it('correctly labels all three field sources together', () => {
      const contextSchema: ContextSchema = {
        systemField: {
          label: 'System Field',
          type: 'string'
        }
      }

      const resolver = () => [
        {
          key: 'external_1',
          label: 'External Field',
          type: 'string' as const,
          group: 'Form Fields' as const
        }
      ]

      const config = createCustomFieldsConfigSection(contextSchema, resolver)
      const fieldsArray = config.fields.fields as ArrayFieldMeta

      const precedingField = { id: 'field_a', type: 'text', label: 'Preceding Field' }

      const options = getConditionFieldOptions(
        fieldsArray,
        { type: 'text', label: 'Current' },
        { index: 1, items: [precedingField], root: {} }
      )

      // Resolved external: (Custom)
      const externalOption = options.find((o) => o.value === 'external_1')
      expect(externalOption?.label).toBe('External Field (Custom)')

      // Preceding custom: (Custom)
      const precedingOption = options.find((o) => o.value === 'field_a')
      expect(precedingOption?.label).toBe('Preceding Field (Custom)')

      // Context schema: NO (Custom)
      const systemOption = options.find((o) => o.value === 'systemField')
      expect(systemOption?.label).toBe('System Field')
    })
  })

  describe('Integration behavior', () => {
    it('supports complex resolver logic based on root values', () => {
      const resolver = (root: Record<string, unknown>) => {
        const section1 = root.section1 as Record<string, unknown> | undefined
        const section2 = root.section2 as Record<string, unknown> | undefined

        const fields = []

        if (section1?.enabled) {
          fields.push({
            key: 'section1_field',
            label: 'Section 1 Field',
            type: 'string' as const,
            group: 'Form Fields' as const
          })
        }

        if (section2?.enabled) {
          fields.push({
            key: 'section2_field',
            label: 'Section 2 Field',
            type: 'number' as const,
            group: 'Form Fields' as const
          })
        }

        return fields
      }

      const config = createCustomFieldsConfigSection(undefined, resolver)
      const fieldsArray = config.fields.fields as ArrayFieldMeta

      // Test with only section1 enabled
      const rootWithSection1 = { section1: { enabled: true }, section2: { enabled: false } }
      const optionsS1 = getConditionFieldOptions(
        fieldsArray,
        { type: 'text', label: 'Test' },
        { index: 0, items: [], root: rootWithSection1 }
      )

      expect(optionsS1.find((o) => o.value === 'section1_field')).toBeDefined()
      expect(optionsS1.find((o) => o.value === 'section2_field')).toBeUndefined()

      // Test with both enabled
      const rootWithBoth = { section1: { enabled: true }, section2: { enabled: true } }
      const optionsBoth = getConditionFieldOptions(
        fieldsArray,
        { type: 'text', label: 'Test' },
        { index: 0, items: [], root: rootWithBoth }
      )

      expect(optionsBoth.find((o) => o.value === 'section1_field')).toBeDefined()
      expect(optionsBoth.find((o) => o.value === 'section2_field')).toBeDefined()
    })
  })
})
