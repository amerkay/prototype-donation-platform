/**
 * Condition Builder Logic Tests for Custom Fields Config Form
 *
 * Tests the condition builder visibility logic, validation, and state management
 * that were fixed to prevent invalid UI states.
 *
 * Tests the actual field configurations (visibleWhen, rules, onChange) that control
 * the UI behavior. This approach tests the logic without mounting the full component tree.
 */
import { describe, it, expect, vi } from 'vitest'
import { createCustomFieldsConfigSection } from '~/features/custom-fields/forms/custom-fields-config-form'
import type { ContextSchema } from '~/features/form-builder/conditions'
import type { ArrayFieldMeta, FieldGroupMeta, FieldContext } from '~/features/form-builder/types'
import { operatorRequiresValue } from '~/features/form-builder/conditions'

describe('custom-fields-config-form - condition builder logic', () => {
  /**
   * Helper to create test context with mock fields
   */
  function createTestContext() {
    // Mock external context schema with different field types
    const contextSchema: ContextSchema = {
      isRecurring: {
        label: 'Is Recurring',
        type: 'boolean',
        description: 'Whether donation is recurring'
      },
      donationType: {
        label: 'Donation Type',
        type: 'string',
        options: [
          { value: 'one-time', label: 'One-time' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'annual', label: 'Annual' }
        ]
      },
      donationFrequency: {
        label: 'Donation Frequency',
        type: 'array',
        description: 'Selected donation frequency',
        options: [
          { value: 'once', label: 'One-time' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' }
        ]
      },
      amount: {
        label: 'Amount',
        type: 'number'
      }
    }

    return { contextSchema }
  }

  /**
   * Helper to get condition field configuration from form section
   */
  function getConditionFieldConfig(contextSchema?: ContextSchema) {
    const section = createCustomFieldsConfigSection(contextSchema)
    const fieldsArray = section.fields.fields as ArrayFieldMeta

    // Simulate a custom field with conditions enabled
    const customFieldValues = {
      type: 'text',
      id: 'text_test',
      label: 'Test Field',
      enableVisibilityConditions: true
    }

    const fieldGroup = (
      fieldsArray.itemField as (
        values: Record<string, unknown>,
        ctx: { index: number; items: Record<string, unknown>[] }
      ) => FieldGroupMeta
    )(customFieldValues, {
      index: 1,
      items: [
        {
          type: 'select',
          id: 'select_team_size',
          label: 'Team Size',
          options: ['1-10', '11-50', '51-200', '200+']
        }
      ]
    })

    // Navigate to condition itemField
    const visibilityConditions = fieldGroup.fields?.visibilityConditions as FieldGroupMeta
    const visibleWhen = visibilityConditions.fields?.visibleWhen as FieldGroupMeta
    const conditions = visibleWhen.fields?.conditions as ArrayFieldMeta
    const conditionItemField = conditions.itemField as (
      values: Record<string, unknown>
    ) => FieldGroupMeta

    return { conditionItemField }
  }

  describe('Field Visibility Logic', () => {
    it('operator field is hidden when no field is selected', () => {
      const { conditionItemField } = getConditionFieldConfig()

      // Condition with no field selected
      const conditionConfig = conditionItemField({})
      const operatorField = conditionConfig.fields?.operator

      expect(operatorField).toBeDefined()
      expect(operatorField?.visibleWhen).toBeDefined()

      // Should return false when no field is selected
      const mockContext: FieldContext = {
        values: {},
        root: {}
      }
      const isVisible = (operatorField?.visibleWhen as (ctx: FieldContext) => boolean)(mockContext)
      expect(isVisible).toBe(false)
    })

    it('operator becomes visible after field selection', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // Condition with field selected
      const conditionConfig = conditionItemField({ field: 'isRecurring' })
      const operatorField = conditionConfig.fields?.operator

      expect(operatorField?.visibleWhen).toBeDefined()

      // Should return true when field is selected
      const mockContext: FieldContext = {
        values: { field: 'isRecurring' },
        root: {}
      }
      const isVisible = (operatorField?.visibleWhen as (ctx: FieldContext) => boolean)(mockContext)
      expect(isVisible).toBe(true)
    })

    it('value field is hidden when no operator is selected', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // Condition with field but no operator
      const conditionConfig = conditionItemField({ field: 'amount' })
      const valueField = conditionConfig.fields?.value

      expect(valueField?.visibleWhen).toBeDefined()

      // Should return false when no operator
      const mockContext: FieldContext = {
        values: { field: 'amount' },
        root: {}
      }
      const isVisible = (valueField?.visibleWhen as (ctx: FieldContext) => boolean)(mockContext)
      expect(isVisible).toBe(false)
    })

    it('value field becomes visible after field and operator selection', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // Condition with field and operator
      const conditionConfig = conditionItemField({ field: 'amount' })
      const valueField = conditionConfig.fields?.value

      expect(valueField?.visibleWhen).toBeDefined()

      // Should return true when both field and operator are set
      const mockContext: FieldContext = {
        values: { field: 'amount', operator: 'greaterOrEqual' },
        root: {}
      }
      const isVisible = (valueField?.visibleWhen as (ctx: FieldContext) => boolean)(mockContext)
      expect(isVisible).toBe(true)
    })

    it('value field remains hidden when operator is invalid', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // Condition with field
      const conditionConfig = conditionItemField({ field: 'amount' })
      const valueField = conditionConfig.fields?.value

      expect(valueField?.visibleWhen).toBeDefined()

      // Should return false when operator is invalid/unknown
      const mockContext: FieldContext = {
        values: { field: 'amount', operator: 'invalidOperator' },
        root: {}
      }
      const isVisible = (valueField?.visibleWhen as (ctx: FieldContext) => boolean)(mockContext)
      expect(isVisible).toBe(false)
    })
  })

  describe('State Management - Field Resets', () => {
    it('field onChange resets operator and value to empty', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      const conditionConfig = conditionItemField({})
      const fieldField = conditionConfig.fields?.field

      expect(fieldField?.onChange).toBeDefined()

      // Mock setValue function
      const mockSetValue = vi.fn()
      fieldField?.onChange?.({
        value: 'amount',
        values: {},
        root: {},
        setValue: mockSetValue
      })

      // Should reset both operator and value
      expect(mockSetValue).toHaveBeenCalledWith('operator', '')
      expect(mockSetValue).toHaveBeenCalledWith('value', '')
    })

    it('operator onChange resets value', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      const conditionConfig = conditionItemField({ field: 'amount' })
      const operatorField = conditionConfig.fields?.operator

      expect(operatorField?.onChange).toBeDefined()

      // Mock setValue function
      const mockSetValue = vi.fn()
      operatorField?.onChange?.({
        value: 'greaterThan',
        values: {},
        root: {},
        setValue: mockSetValue
      })

      // Should reset value
      expect(mockSetValue).toHaveBeenCalledWith('value', '')
    })

    it('operator onChange initializes value as array for in/notIn operators', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      const conditionConfig = conditionItemField({ field: 'amount' })
      const operatorField = conditionConfig.fields?.operator

      expect(operatorField?.onChange).toBeDefined()

      // Mock setValue function
      const mockSetValue = vi.fn()

      // Test 'in' operator
      operatorField?.onChange?.({
        value: 'in',
        values: {},
        root: {},
        setValue: mockSetValue
      })

      expect(mockSetValue).toHaveBeenCalledWith('value', [])

      // Test 'notIn' operator
      mockSetValue.mockClear()
      operatorField?.onChange?.({
        value: 'notIn',
        values: {},
        root: {},
        setValue: mockSetValue
      })

      expect(mockSetValue).toHaveBeenCalledWith('value', [])
    })
  })

  describe('Validation Requirements', () => {
    it('field is required', () => {
      const { conditionItemField } = getConditionFieldConfig()

      const conditionConfig = conditionItemField({})
      const fieldField = conditionConfig.fields?.field

      expect(fieldField?.rules).toBeDefined()
      // Should have z.string().min(1) validation
    })

    it('operator is required', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      const conditionConfig = conditionItemField({ field: 'amount' })
      const operatorField = conditionConfig.fields?.operator

      expect(operatorField?.rules).toBeDefined()
      // Should have z.string().min(1) validation
    })

    it('value is required when visible', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      const conditionConfig = conditionItemField({ field: 'amount' })
      const valueField = conditionConfig.fields?.value

      expect(valueField?.rules).toBeDefined()
      // Should have validation for required value
    })
  })

  describe('Dynamic Value Field Rendering', () => {
    it('value field is select type for fields with options', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // Select field with options (donationType)
      const conditionConfig = conditionItemField({ field: 'donationType' })
      const valueField = conditionConfig.fields?.value as { type: string; options?: unknown[] }

      expect(valueField?.type).toBe('select')
      expect(valueField?.options).toBeDefined()
      expect(Array.isArray(valueField?.options)).toBe(true)
    })

    it('value field is number type for number fields without options', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // Number field without options (amount)
      const conditionConfig = conditionItemField({ field: 'amount' })
      const valueField = conditionConfig.fields?.value as { type: string }

      // After refactor: number fields use type: 'number' instead of text with inputType
      expect(valueField?.type).toBe('number')
    })

    it('value field becomes array type for in/notIn operators ONLY when value is array', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // Field with options and 'in' operator - value should be array type only if value is []
      const conditionConfigIn = conditionItemField({
        field: 'donationFrequency', // Array field for in/notIn
        operator: 'in',
        value: [] // Must provide array value
      })
      const valueFieldIn = conditionConfigIn.fields?.value

      expect(valueFieldIn).toBeDefined()
      expect(valueFieldIn?.type).toBe('array')
      expect(valueFieldIn?.visibleWhen).toBeDefined()

      // Should be visible for 'in' operator
      const mockContextIn: FieldContext = {
        values: { field: 'donationFrequency', operator: 'in' },
        root: {}
      }
      const isVisibleIn = (valueFieldIn?.visibleWhen as (ctx: FieldContext) => boolean)(
        mockContextIn
      )
      expect(isVisibleIn).toBe(true)

      // Field with options and 'notIn' operator
      const conditionConfigNotIn = conditionItemField({
        field: 'donationFrequency', // Array field for in/notIn
        operator: 'notIn',
        value: [] // Must provide array value
      })
      const valueFieldNotIn = conditionConfigNotIn.fields?.value

      expect(valueFieldNotIn?.type).toBe('array')

      // Should be visible for 'notIn' operator
      const mockContextNotIn: FieldContext = {
        values: { field: 'donationType', operator: 'notIn' },
        root: {}
      }
      const isVisibleNotIn = (valueFieldNotIn?.visibleWhen as (ctx: FieldContext) => boolean)(
        mockContextNotIn
      )
      expect(isVisibleNotIn).toBe(true)
    })

    it('value field is hidden/text placeholder if operator is in/notIn but value is not array', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // 'in' operator but value is string (transition state)
      const conditionConfigTransition = conditionItemField({
        field: 'donationType',
        operator: 'in',
        value: '' // Invalid value for array
      })

      const valueField = conditionConfigTransition.fields?.value
      expect(valueField?.type).toBe('text') // Should fallback to text

      const isVisible = (valueField?.visibleWhen as () => boolean)()
      expect(isVisible).toBe(false) // Should be hidden
    })

    it('value field is hidden for operators that do not require a value', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      const conditionConfig = conditionItemField({ field: 'amount' })
      const valueField = conditionConfig.fields?.value

      expect(valueField?.visibleWhen).toBeDefined()

      // Should be hidden for 'empty' operator (doesn't require value)
      const mockContext: FieldContext = {
        values: { field: 'amount', operator: 'empty' },
        root: {}
      }
      const isVisible = (valueField?.visibleWhen as (ctx: FieldContext) => boolean)(mockContext)
      expect(isVisible).toBe(false)
    })
  })

  describe('Combined Visibility Logic', () => {
    it('operator visibility depends on field selection', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // Without field
      const conditionConfigEmpty = conditionItemField({})
      const operatorFieldEmpty = conditionConfigEmpty.fields?.operator
      const mockContextEmpty: FieldContext = {
        values: {},
        root: {}
      }
      const isVisibleEmpty = (operatorFieldEmpty?.visibleWhen as (ctx: FieldContext) => boolean)(
        mockContextEmpty
      )
      expect(isVisibleEmpty).toBe(false)

      // With field
      const conditionConfigWithField = conditionItemField({ field: 'amount' })
      const operatorFieldWithField = conditionConfigWithField.fields?.operator
      const mockContextWithField: FieldContext = {
        values: { field: 'amount' },
        root: {}
      }
      const isVisibleWithField = (
        operatorFieldWithField?.visibleWhen as (ctx: FieldContext) => boolean
      )(mockContextWithField)
      expect(isVisibleWithField).toBe(true)
    })

    it('value visibility depends on both field and operator', () => {
      const { contextSchema } = createTestContext()
      const { conditionItemField } = getConditionFieldConfig(contextSchema)

      // Without field
      const conditionConfigNoField = conditionItemField({})
      const valueFieldNoField = conditionConfigNoField.fields?.value
      const mockContextNoField: FieldContext = {
        values: { operator: 'greaterOrEqual' },
        root: {}
      }
      const isVisibleNoField = (valueFieldNoField?.visibleWhen as (ctx: FieldContext) => boolean)(
        mockContextNoField
      )
      expect(isVisibleNoField).toBe(false)

      // With field but no operator
      const conditionConfigNoOp = conditionItemField({ field: 'amount' })
      const valueFieldNoOp = conditionConfigNoOp.fields?.value
      const mockContextNoOp: FieldContext = {
        values: { field: 'amount' },
        root: {}
      }
      const isVisibleNoOp = (valueFieldNoOp?.visibleWhen as (ctx: FieldContext) => boolean)(
        mockContextNoOp
      )
      expect(isVisibleNoOp).toBe(false)

      // With both field and operator
      const conditionConfigBoth = conditionItemField({ field: 'amount' })
      const valueFieldBoth = conditionConfigBoth.fields?.value
      const mockContextBoth: FieldContext = {
        values: { field: 'amount', operator: 'greaterOrEqual' },
        root: {}
      }
      const isVisibleBoth = (valueFieldBoth?.visibleWhen as (ctx: FieldContext) => boolean)(
        mockContextBoth
      )
      expect(isVisibleBoth).toBe(true)
    })
  })

  describe('Operator Requirements Utility', () => {
    it('operators that do not require values', () => {
      expect(operatorRequiresValue('empty')).toBe(false)
      expect(operatorRequiresValue('notEmpty')).toBe(false)
      expect(operatorRequiresValue('isTrue')).toBe(false)
      expect(operatorRequiresValue('isFalse')).toBe(false)
    })

    it('operators that require values', () => {
      expect(operatorRequiresValue('contains')).toBe(true)
      expect(operatorRequiresValue('notContains')).toBe(true)
      expect(operatorRequiresValue('greaterOrEqual')).toBe(true)
      expect(operatorRequiresValue('lessOrEqual')).toBe(true)
      expect(operatorRequiresValue('in')).toBe(true)
      expect(operatorRequiresValue('notIn')).toBe(true)
    })
  })
})
