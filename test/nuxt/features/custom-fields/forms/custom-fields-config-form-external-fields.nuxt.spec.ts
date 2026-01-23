import { describe, expect, it } from 'vitest'
import { computed } from 'vue'
import { useCustomFieldsConfigForm } from '~/features/_library/custom-fields/forms/custom-fields-config-form'
import type {
  ArrayFieldDef,
  FieldGroupDef,
  SelectFieldDef,
  FormContext
} from '~/features/_library/form-builder/types'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import type { AvailableField } from '~/features/_library/form-builder/composables/useAvailableFields'

function createMockFormContext(values: Record<string, unknown> = {}): FormContext {
  return {
    values: computed(() => values),
    form: computed(() => values)
  }
}

describe('custom-fields-config-form - External Fields Resolution', () => {
  /**
   * Helper to get the field selector options from condition builder
   * This is the public API that users interact with - the list of fields
   * available for creating conditions
   */
  function getAvailableFieldsForConditions(
    contextSchema?: ContextSchema,
    resolver?: (root: Record<string, unknown>) => AvailableField[],
    rootValues: Record<string, unknown> = {},
    precedingFields: Array<Record<string, unknown>> = []
  ): Array<{ value: string; label: string }> {
    const section = useCustomFieldsConfigForm(contextSchema, resolver)
    const fields = section.setup(createMockFormContext())
    const fieldsArray = fields.fields as ArrayFieldDef

    // Create a field item with visibility conditions enabled
    const itemFieldFn = fieldsArray.itemField as (
      v: Record<string, unknown>,
      c: { index: number; items: Record<string, unknown>[]; root: Record<string, unknown> }
    ) => FieldGroupDef

    const fieldItem = itemFieldFn(
      {
        type: 'text',
        id: 'current_field',
        label: 'Current Field',
        enableVisibilityConditions: true
      },
      {
        index: precedingFields.length,
        items: precedingFields,
        root: rootValues
      }
    )

    // Access the condition builder field selector
    const visibilityConditions = fieldItem.fields?.visibilityConditions as FieldGroupDef
    const visibleWhen = visibilityConditions.fields?.visibleWhen as FieldGroupDef
    const conditions = visibleWhen.fields?.conditions as ArrayFieldDef
    const conditionItemField = conditions.itemField as (v: Record<string, unknown>) => FieldGroupDef

    const conditionItem = conditionItemField({})
    const fieldSelector = conditionItem.fields?.field as SelectFieldDef

    return fieldSelector.options as Array<{ value: string; label: string }>
  }

  describe('External field resolution', () => {
    it('provides root context to resolver when fields are requested', () => {
      let capturedRoot: Record<string, unknown> | undefined

      const resolver = (root: Record<string, unknown>) => {
        capturedRoot = root
        return []
      }

      const rootValues = { someData: 'test', otherField: 42 }

      getAvailableFieldsForConditions(undefined, resolver, rootValues)

      expect(capturedRoot).toBeDefined()
      expect(capturedRoot).toEqual(rootValues)
    })

    it('includes resolved external fields in available condition fields', () => {
      const resolver = (root: Record<string, unknown>) => {
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

      const precedingField = { id: 'field_a', type: 'text', label: 'Preceding Field' }

      const rootValues = {
        externalSection: {
          fields: [{ id: 'external_field_1', type: 'text', label: 'External Field 1' }]
        }
      }

      const options = getAvailableFieldsForConditions(undefined, resolver, rootValues, [
        precedingField
      ])

      // Verify both preceding and external fields are available
      expect(options.find((o) => o.value === 'field_a')).toBeDefined()
      expect(options.find((o) => o.value === 'external_field_1')).toBeDefined()
    })

    it('places external fields before preceding custom fields in options', () => {
      const resolver = () => [
        {
          key: 'external_1',
          label: 'External 1',
          type: 'string' as const,
          group: 'Form Fields' as const
        }
      ]

      const precedingField = { id: 'field_a', type: 'text', label: 'Preceding Field' }

      const options = getAvailableFieldsForConditions(undefined, resolver, {}, [precedingField])

      const external1Index = options.findIndex((o) => o.value === 'external_1')
      const fieldAIndex = options.findIndex((o) => o.value === 'field_a')

      expect(external1Index).toBeGreaterThanOrEqual(0)
      expect(fieldAIndex).toBeGreaterThanOrEqual(0)
      expect(external1Index).toBeLessThan(fieldAIndex)
    })

    it('handles empty resolver result without errors', () => {
      const resolver = () => []

      const precedingField = { id: 'field_a', type: 'text', label: 'Field A' }

      const options = getAvailableFieldsForConditions(undefined, resolver, {}, [precedingField])

      // Should still include preceding field even when resolver returns empty
      expect(options.find((o) => o.value === 'field_a')).toBeDefined()
    })
  })

  describe('Field label formatting', () => {
    it('appends (Custom) suffix to resolved external field labels', () => {
      const resolver = () => [
        {
          key: 'external_1',
          label: 'External Question',
          type: 'string' as const,
          group: 'Form Fields' as const
        }
      ]

      const options = getAvailableFieldsForConditions(undefined, resolver)

      const externalOption = options.find((o) => o.value === 'external_1')
      expect(externalOption?.label).toBe('External Question (Custom)')
    })

    it('appends (Custom) suffix to preceding custom field labels', () => {
      const precedingField = { id: 'field_a', type: 'text', label: 'Preceding Question' }

      const options = getAvailableFieldsForConditions(undefined, undefined, {}, [precedingField])

      const precedingOption = options.find((o) => o.value === 'field_a')
      expect(precedingOption?.label).toBe('Preceding Question (Custom)')
    })

    it('does not append (Custom) suffix to context schema fields', () => {
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

      const options = getAvailableFieldsForConditions(contextSchema)

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

      const precedingField = { id: 'field_a', type: 'text', label: 'Preceding Field' }

      const options = getAvailableFieldsForConditions(contextSchema, resolver, {}, [precedingField])

      // Verify each source has correct label format
      const externalOption = options.find((o) => o.value === 'external_1')
      expect(externalOption?.label).toBe('External Field (Custom)')

      const precedingOption = options.find((o) => o.value === 'field_a')
      expect(precedingOption?.label).toBe('Preceding Field (Custom)')

      const systemOption = options.find((o) => o.value === 'systemField')
      expect(systemOption?.label).toBe('System Field')
    })
  })

  describe('Dynamic resolver behavior', () => {
    it('adapts field resolution based on root values', () => {
      const resolver = (root: Record<string, unknown>) => {
        const section1 = root.section1 as Record<string, unknown> | undefined
        const section2 = root.section2 as Record<string, unknown> | undefined

        const fields: AvailableField[] = []

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

      // Test with only section1 enabled
      const rootWithSection1 = { section1: { enabled: true }, section2: { enabled: false } }
      const optionsS1 = getAvailableFieldsForConditions(undefined, resolver, rootWithSection1)

      expect(optionsS1.find((o) => o.value === 'section1_field')).toBeDefined()
      expect(optionsS1.find((o) => o.value === 'section2_field')).toBeUndefined()

      // Test with both enabled
      const rootWithBoth = { section1: { enabled: true }, section2: { enabled: true } }
      const optionsBoth = getAvailableFieldsForConditions(undefined, resolver, rootWithBoth)

      expect(optionsBoth.find((o) => o.value === 'section1_field')).toBeDefined()
      expect(optionsBoth.find((o) => o.value === 'section2_field')).toBeDefined()
    })
  })
})
