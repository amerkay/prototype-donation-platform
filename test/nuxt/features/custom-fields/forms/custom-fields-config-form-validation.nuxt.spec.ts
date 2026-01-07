import { describe, expect, it } from 'vitest'
import { createCustomFieldsConfigSection } from '~/features/custom-fields/forms/custom-fields-config-form'
import type {
  ArrayFieldMeta,
  FieldGroupMeta,
  ArrayItemContext
} from '~/features/form-builder/types'
import type { ContextSchema } from '~/features/form-builder/conditions'
import { createFieldReferenceSchema } from '~/features/custom-fields/forms/validation-helpers'

describe('custom-fields-config-form - Field Reference Validation', () => {
  /**
   * Helper to get condition field configuration
   */
  function getConditionFieldConfig(contextSchema?: ContextSchema) {
    const formDef = createCustomFieldsConfigSection(contextSchema)
    const fieldsArray = formDef.fields.fields as ArrayFieldMeta

    // Mock preceding fields (simulate two fields: field_a and field_b)
    const mockFieldA = { id: 'field_a', type: 'text', label: 'Field A' }
    const mockFieldB = {
      id: 'field_b',
      type: 'select',
      label: 'Field B',
      options: ['opt1', 'opt2']
    }

    const fieldGroupMeta = (
      fieldsArray.itemField as (v: Record<string, unknown>, ctx: ArrayItemContext) => FieldGroupMeta
    )({ type: 'text', label: 'Field C' }, { index: 2, items: [mockFieldA, mockFieldB] })

    // Navigate to the conditions array itemField
    const visibilityConditions = fieldGroupMeta.fields?.visibilityConditions as FieldGroupMeta
    const visibleWhen = visibilityConditions?.fields?.visibleWhen as FieldGroupMeta
    const conditionsArray = visibleWhen?.fields?.conditions as ArrayFieldMeta
    const conditionItemField = conditionsArray?.itemField as (
      v: Record<string, unknown>
    ) => FieldGroupMeta

    return { conditionItemField, mockFieldA, mockFieldB }
  }

  describe('Field Select Validation', () => {
    it('includes Zod refine validation on field select', () => {
      const { conditionItemField } = getConditionFieldConfig()

      const conditionConfig = conditionItemField({})
      const fieldField = conditionConfig.fields?.field

      expect(fieldField?.rules).toBeDefined()
      expect(fieldField?.type).toBe('select')

      // The rules should be a Zod schema with refine
      const rules = fieldField?.rules
      expect(rules).toHaveProperty('_def')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((rules as any)._def.typeName).toBe('ZodEffects') // Zod.refine creates ZodEffects
    })

    it('validates that selected field exists in available fields', () => {
      const availableFields = [
        {
          key: 'field_a',
          label: 'Field A',
          type: 'string' as const,
          group: 'Form Fields' as const
        },
        {
          key: 'field_b',
          label: 'Field B',
          type: 'string' as const,
          group: 'Form Fields' as const
        }
      ]

      const schema = createFieldReferenceSchema(availableFields, 'field')

      // Valid field reference
      expect(() => schema.parse('field_a')).not.toThrow()
      expect(() => schema.parse('field_b')).not.toThrow()

      // Invalid field reference
      expect(() => schema.parse('nonexistent_field')).toThrow(/This field is no longer available/)
    })

    it('shows validation error when field is removed', () => {
      const availableFields = [
        {
          key: 'field_a',
          label: 'Field A',
          type: 'string' as const,
          group: 'Form Fields' as const
        }
      ]

      const schema = createFieldReferenceSchema(availableFields, 'field')

      // Field that was valid before but removed now
      expect(() => schema.parse('field_b')).toThrow(/This field is no longer available/)
    })

    it('shows validation error when field is reordered to come after current field', () => {
      // Simulate: Field C references field_b, but field_b is now AFTER field_c
      const availableFieldsAfterReorder = [
        {
          key: 'field_a',
          label: 'Field A',
          type: 'string' as const,
          group: 'Form Fields' as const
        }
        // field_b no longer available because it's after field_c now
      ]

      const schema = createFieldReferenceSchema(availableFieldsAfterReorder, 'field')

      expect(() => schema.parse('field_b')).toThrow(/This field is no longer available/)
    })

    it('validates empty string as required', () => {
      const availableFields = [
        { key: 'field_a', label: 'Field A', type: 'string' as const, group: 'Form Fields' as const }
      ]

      const schema = createFieldReferenceSchema(availableFields, 'field')

      expect(() => schema.parse('')).toThrow(/Field is required/)
    })
  })

  describe('External Context Field Validation', () => {
    it('validates external context fields remain valid', () => {
      const availableFields = [
        {
          key: 'field_a',
          label: 'Field A',
          type: 'string' as const,
          group: 'Form Fields' as const
        },
        {
          key: 'userTier',
          label: 'User Tier',
          type: 'string' as const,
          group: 'External Context' as const
        },
        {
          key: 'isVerified',
          label: 'Is Verified',
          type: 'boolean' as const,
          group: 'External Context' as const
        }
      ]

      const schema = createFieldReferenceSchema(availableFields, 'field')

      // Custom field references
      expect(() => schema.parse('field_a')).not.toThrow()

      // External context references
      expect(() => schema.parse('userTier')).not.toThrow()
      expect(() => schema.parse('isVerified')).not.toThrow()

      // Invalid reference
      expect(() => schema.parse('nonexistent')).toThrow()
    })
  })

  describe('Integration with Condition Builder', () => {
    it('condition field select uses dynamic validation', () => {
      const { conditionItemField } = getConditionFieldConfig()

      // Create condition config
      const conditionConfig = conditionItemField({})
      const fieldField = conditionConfig.fields?.field

      expect(fieldField?.rules).toBeDefined()

      // Rules should be a Zod schema with refine
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rules = fieldField?.rules as any
      expect(rules._def.typeName).toBe('ZodEffects')
    })

    it('condition builder includes external context fields in validation', () => {
      const contextSchema: ContextSchema = {
        donorLevel: {
          label: 'Donor Level',
          type: 'string' as const,
          options: [
            { value: 'bronze', label: 'Bronze' },
            { value: 'silver', label: 'Silver' },
            { value: 'gold', label: 'Gold' }
          ]
        }
      }

      const { conditionItemField } = getConditionFieldConfig(contextSchema)
      const conditionConfig = conditionItemField({})
      const fieldField = conditionConfig.fields?.field

      // Should have options including external context
      expect(fieldField?.type).toBe('select')
      if (fieldField?.type === 'select' && 'options' in fieldField) {
        const options = fieldField.options as Array<{ value: string; label: string }>
        const externalFieldOption = options.find((opt) => opt.value === 'donorLevel')

        expect(externalFieldOption).toBeDefined()
        expect(externalFieldOption?.label).toBe('Donor Level')
      }
    })
  })

  describe('User Experience', () => {
    it('provides clear error message when field reference becomes invalid', () => {
      const availableFields = [
        {
          key: 'field_a',
          label: 'Field A',
          type: 'string' as const,
          group: 'Form Fields' as const
        }
      ]

      const schema = createFieldReferenceSchema(availableFields, 'field')

      try {
        schema.parse('deleted_field')
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const zodError = error as any
        expect(zodError.errors[0].message).toContain('This field is no longer available')
        expect(zodError.errors[0].message).toContain(
          'It may have been moved below this field, renamed, or removed.'
        )
      }
    })
  })
})
