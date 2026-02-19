/**
 * Condition Builder Unit Tests for Custom Fields Config Form
 *
 * Tests the condition field builder factory function that generates form configuration.
 * These tests verify that the builder produces correct field metadata for the form renderer.
 *
 * NOTE: This is unit testing a factory function that returns configuration metadata.
 * For behavior testing of the rendered form, see custom-fields-config-form.nuxt.spec.ts
 */
import { describe, it, expect, vi } from 'vitest'
import {
  buildConditionItemField,
  operatorRequiresValue
} from '~/features/_library/form-builder/conditions'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import type { AvailableField } from '~/features/_library/form-builder/composables/useAvailableFields'
import type { FieldContext, FieldGroupDef } from '~/features/_library/form-builder/types'

describe('condition-field-builder', () => {
  /**
   * Helper to create test context with mock fields
   */
  function createMockFields(): {
    precedingFields: AvailableField[]
    contextSchema: ContextSchema
  } {
    const precedingFields: AvailableField[] = [
      {
        key: 'teamSize',
        label: 'Team Size',
        type: 'string',
        options: [
          { value: '1-10', label: '1-10' },
          { value: '11-50', label: '11-50' }
        ],
        group: 'Form Fields'
      }
    ]

    const contextSchema: ContextSchema = {
      isRecurring: {
        label: 'Is Recurring',
        type: 'boolean'
      },
      donationType: {
        label: 'Donation Type',
        type: 'string',
        options: [
          { value: 'one-time', label: 'One-time' },
          { value: 'monthly', label: 'Monthly' }
        ]
      },
      amount: {
        label: 'Amount',
        type: 'number'
      }
    }

    return { precedingFields, contextSchema }
  }

  describe('buildConditionItemField', () => {
    it('returns a function that generates field-group configuration', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      expect(typeof builder).toBe('function')

      const config = builder({}) as FieldGroupDef
      expect(config.type).toBe('field-group')
      expect(config.fields).toHaveProperty('field')
      expect(config.fields).toHaveProperty('operator')
      expect(config.fields).toHaveProperty('value')
    })

    it('includes all available fields in field selector options', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      const config = builder({}) as FieldGroupDef
      const fieldField = config.fields?.field
      expect(fieldField).toBeDefined()
      expect('options' in fieldField!).toBe(true)
      const fieldOptions = (fieldField as { options: Array<{ value: string; label: string }> })
        .options

      expect(fieldOptions).toBeDefined()
      expect(fieldOptions.length).toBeGreaterThan(0)

      // Should include preceding fields
      expect(fieldOptions.some((opt) => opt.value === 'teamSize')).toBe(true)
      // Should include context schema fields
      expect(fieldOptions.some((opt) => opt.value === 'isRecurring')).toBe(true)
      expect(fieldOptions.some((opt) => opt.value === 'donationType')).toBe(true)
      expect(fieldOptions.some((opt) => opt.value === 'amount')).toBe(true)
    })

    it('field selector onChange auto-selects first operator and value', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      const config = builder({}) as FieldGroupDef
      const fieldOnChange = config.fields?.field?.onChange

      expect(fieldOnChange).toBeDefined()

      const mockSetValue = vi.fn()

      // Number field: auto-selects first operator (greaterOrEqual), value ''
      fieldOnChange?.({
        value: 'amount',
        values: {},
        root: {},
        setValue: mockSetValue
      })

      expect(mockSetValue).toHaveBeenCalledWith('operator', 'greaterOrEqual')
      expect(mockSetValue).toHaveBeenCalledWith('value', '')

      // Enum field: auto-selects 'in' operator, pre-fills first option
      mockSetValue.mockClear()
      fieldOnChange?.({
        value: 'donationType',
        values: {},
        root: {},
        setValue: mockSetValue
      })

      expect(mockSetValue).toHaveBeenCalledWith('operator', 'in')
      expect(mockSetValue).toHaveBeenCalledWith('value', ['one-time'])
    })

    it('operator selector onChange resets value to empty string', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      const config = builder({ field: 'amount' }) as FieldGroupDef
      const operatorOnChange = config.fields?.operator?.onChange

      expect(operatorOnChange).toBeDefined()

      const mockSetValue = vi.fn()
      operatorOnChange?.({
        value: 'greaterThan',
        values: { field: 'amount' },
        root: {},
        setValue: mockSetValue
      })

      expect(mockSetValue).toHaveBeenCalledWith('value', '')
    })

    it('operator selector onChange pre-fills first option for in/notIn on enum fields', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      const config = builder({ field: 'donationType' }) as FieldGroupDef
      const operatorOnChange = config.fields?.operator?.onChange

      expect(operatorOnChange).toBeDefined()

      const mockSetValue = vi.fn()

      // Test 'in' operator on enum field: pre-fills first option
      operatorOnChange?.({
        value: 'in',
        values: { field: 'donationType' },
        root: {},
        setValue: mockSetValue
      })

      expect(mockSetValue).toHaveBeenCalledWith('value', ['one-time'])

      // Test 'notIn' operator on enum field: pre-fills first option
      mockSetValue.mockClear()
      operatorOnChange?.({
        value: 'notIn',
        values: { field: 'donationType' },
        root: {},
        setValue: mockSetValue
      })

      expect(mockSetValue).toHaveBeenCalledWith('value', ['one-time'])

      // Test 'in' on non-enum field: empty array
      mockSetValue.mockClear()
      operatorOnChange?.({
        value: 'in',
        values: { field: 'amount' },
        root: {},
        setValue: mockSetValue
      })

      expect(mockSetValue).toHaveBeenCalledWith('value', [])
    })

    it('operator field visibility depends on field selection', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      // Without field selected
      const configEmpty = builder({}) as FieldGroupDef
      const operatorVisibleEmpty = configEmpty.fields?.operator?.visibleWhen as (
        ctx: FieldContext
      ) => boolean
      expect(operatorVisibleEmpty({ values: {}, root: {} })).toBe(false)

      // With field selected
      const configWithField = builder({ field: 'amount' }) as FieldGroupDef
      const operatorVisibleWithField = configWithField.fields?.operator?.visibleWhen as (
        ctx: FieldContext
      ) => boolean
      expect(operatorVisibleWithField({ values: { field: 'amount' }, root: {} })).toBe(true)
    })

    it('value field visibility depends on field, operator, and operator requirement', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      // Without field
      const configNoField = builder({}) as FieldGroupDef
      const valueVisibleNoField = configNoField.fields?.value?.visibleWhen as (
        ctx: FieldContext
      ) => boolean
      expect(valueVisibleNoField({ values: { operator: 'greaterOrEqual' }, root: {} })).toBe(false)

      // With field but no operator
      const configNoOp = builder({ field: 'amount' }) as FieldGroupDef
      const valueVisibleNoOp = configNoOp.fields?.value?.visibleWhen as (
        ctx: FieldContext
      ) => boolean
      expect(valueVisibleNoOp({ values: { field: 'amount' }, root: {} })).toBe(false)

      // With field and operator that requires value
      const configWithBoth = builder({ field: 'amount' }) as FieldGroupDef
      const valueVisibleWithBoth = configWithBoth.fields?.value?.visibleWhen as (
        ctx: FieldContext
      ) => boolean
      expect(
        valueVisibleWithBoth({ values: { field: 'amount', operator: 'greaterOrEqual' }, root: {} })
      ).toBe(true)

      // With field and operator that doesn't require value
      expect(
        valueVisibleWithBoth({ values: { field: 'amount', operator: 'empty' }, root: {} })
      ).toBe(false)
    })

    it('value field is combobox type for fields with options', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      const config = builder({ field: 'donationType' }) as FieldGroupDef
      const valueField = config.fields?.value

      expect(valueField?.type).toBe('combobox')
      expect('options' in valueField!).toBe(true)
    })

    it('value field is number type for number fields', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      const config = builder({ field: 'amount' }) as FieldGroupDef
      const valueField = config.fields?.value

      expect(valueField?.type).toBe('number')
    })

    it('value field is combobox with multiple for in/notIn operators with array value', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      const config = builder({
        field: 'donationType',
        operator: 'in',
        value: []
      }) as FieldGroupDef
      const valueField = config.fields?.value

      expect(valueField?.type).toBe('combobox')
      expect((valueField as unknown as Record<string, unknown>).multiple).toBe(true)
    })

    it('value field is hidden placeholder when in/notIn operator but value not array', () => {
      const { precedingFields, contextSchema } = createMockFields()
      const builder = buildConditionItemField(precedingFields, contextSchema)

      // Transition state: 'in' operator but value is string
      const config = builder({
        field: 'donationType',
        operator: 'in',
        value: '' // Not an array
      }) as FieldGroupDef
      const valueField = config.fields?.value

      expect(valueField?.type).toBe('text')
      const isVisible = (valueField?.visibleWhen as () => boolean)?.()
      expect(isVisible).toBe(false)
    })
  })

  describe('operatorRequiresValue utility', () => {
    it('returns false for operators that do not require values', () => {
      expect(operatorRequiresValue('empty')).toBe(false)
      expect(operatorRequiresValue('notEmpty')).toBe(false)
      expect(operatorRequiresValue('isTrue')).toBe(false)
      expect(operatorRequiresValue('isFalse')).toBe(false)
    })

    it('returns true for operators that require values', () => {
      expect(operatorRequiresValue('contains')).toBe(true)
      expect(operatorRequiresValue('notContains')).toBe(true)
      expect(operatorRequiresValue('greaterOrEqual')).toBe(true)
      expect(operatorRequiresValue('lessOrEqual')).toBe(true)
      expect(operatorRequiresValue('in')).toBe(true)
      expect(operatorRequiresValue('notIn')).toBe(true)
    })
  })
})
