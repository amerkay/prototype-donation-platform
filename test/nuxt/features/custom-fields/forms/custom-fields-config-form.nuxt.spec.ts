import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { useCustomFieldsConfigForm } from '~/features/custom-fields/forms/custom-fields-config-form'
import type {
  ArrayFieldDef,
  FieldGroupDef,
  ArrayItemContext,
  FormContext,
  FieldDef
} from '~/features/form-builder/types'

function createMockFormContext(values: Record<string, unknown> = {}): FormContext {
  return {
    values: computed(() => values),
    form: computed(() => values)
  }
}

describe('custom-fields-config-form', () => {
  describe('useCustomFieldsConfigForm', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('creates form definition with enabled toggle and fields array', () => {
      const formDef = useCustomFieldsConfigForm()

      expect(formDef.id).toBe('customFields')
      expect(formDef.setup(createMockFormContext()).enabled).toBeDefined()
      expect(formDef.setup(createMockFormContext()).fields).toBeDefined()
    })

    it('generates field configuration with required editor fields when no type selected', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupDef
      )({}, { index: 0, items: [], root: {} })

      // Should be collapsible and open by default for new fields
      expect(fieldGroup.collapsible).toBe(true)
      expect(fieldGroup.collapsibleDefaultOpen).toBe(true)
      expect(fieldGroup.label).toBe('New Custom Field')

      // Should have type selector, label input, and hidden id field
      expect(fieldGroup.fields?.type).toBeDefined()
      expect(fieldGroup.fields?.label).toBeDefined()
      expect(fieldGroup.fields?.id).toBeDefined()
    })

    it('generates type-specific configuration when field type is selected', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      // Text fields get advanced settings
      const textField = (
        fieldsArray.itemField as (
          values: Record<string, unknown>,
          context: ArrayItemContext
        ) => FieldDef
      )({ type: 'text', label: 'Username' }, { index: 0, items: [], root: {} }) as FieldGroupDef

      expect(textField.label).toBe('Text: Username')
      expect(textField.fields?.advancedSettings).toBeDefined()

      // Slider fields get min/max configuration
      const sliderField = (
        fieldsArray.itemField as (
          values: Record<string, unknown>,
          context: ArrayItemContext
        ) => FieldDef
      )({ type: 'slider', label: 'Amount' }, { index: 0, items: [], root: {} }) as FieldGroupDef

      expect(sliderField.label).toBe('Slider: Amount')
      expect(sliderField.fields?.min).toBeDefined()
      expect(sliderField.fields?.max).toBeDefined()

      // Select fields get options array
      const selectField = (
        fieldsArray.itemField as (
          values: Record<string, unknown>,
          context: ArrayItemContext
        ) => FieldDef
      )({ type: 'select', label: 'Country' }, { index: 0, items: [], root: {} }) as FieldGroupDef

      expect(selectField.label).toBe('Select: Country')
      expect(selectField.fields?.options).toBeDefined()
    })

    it('truncates long labels in display', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      expect(typeof fieldsArray.itemField).toBe('function')

      const longLabelValues = {
        type: 'text',
        label: 'This is a very long label that should be truncated to prevent UI issues'
      }
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupDef
      )(longLabelValues, { index: 0, items: [], root: {} })

      expect(fieldGroup.label).toContain('Text: This is a very long label')
      expect(fieldGroup.label).toContain('...')
      expect((fieldGroup.label as string)?.length).toBeLessThan(50)
    })

    it('handles empty label gracefully', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      expect(typeof fieldsArray.itemField).toBe('function')

      const noLabelValues = { type: 'text', label: '' }
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupDef
      )(noLabelValues, { index: 0, items: [], root: {} })

      expect(fieldGroup.label).toBe('Text')
    })

    it('shows fields array only when custom fields are enabled', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields

      expect(fieldsArray?.visibleWhen).toBeDefined()

      if (fieldsArray?.visibleWhen && typeof fieldsArray.visibleWhen === 'function') {
        expect(fieldsArray.visibleWhen({ values: { enabled: true }, root: {} })).toBe(true)
        expect(fieldsArray.visibleWhen({ values: { enabled: false }, root: {} })).toBe(false)
      }
    })

    it('configures array as sortable with appropriate add button text', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      expect(fieldsArray.sortable).toBe(true)
      expect(fieldsArray.addButtonText).toBe('Add Custom Field')
    })

    it('includes external context fields in condition builder', () => {
      const contextSchema = {
        subscriptionTier: {
          label: 'Subscription Tier',
          type: 'string' as const,
          options: [
            { value: 'free', label: 'Free' },
            { value: 'premium', label: 'Premium' }
          ]
        },
        donationCount: {
          label: 'Total Donations',
          type: 'number' as const
        }
      }

      const formDef = useCustomFieldsConfigForm(contextSchema)
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      // Get the itemField function and call it with a text field config
      const textFieldValues = { type: 'text', label: 'Test Field', id: 'test_field' }
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupDef
      )(textFieldValues, { index: 0, items: [textFieldValues], root: {} })

      // Navigate to visibility conditions
      const visibilityConditions = fieldGroup.fields?.visibilityConditions as FieldGroupDef
      expect(visibilityConditions).toBeDefined()
      expect(visibilityConditions.type).toBe('field-group')

      const visibleWhen = visibilityConditions.fields?.visibleWhen as FieldGroupDef
      expect(visibleWhen).toBeDefined()

      const conditions = visibleWhen.fields?.conditions as ArrayFieldDef
      expect(conditions).toBeDefined()
      expect(conditions.type).toBe('array')

      // Get a condition item to check field options
      const conditionItemField =
        typeof conditions.itemField === 'function'
          ? conditions.itemField({}, { index: 0, items: [], root: {} })
          : conditions.itemField

      expect(conditionItemField.type).toBe('field-group')

      const fieldSelector = (conditionItemField as FieldGroupDef).fields?.field
      expect(fieldSelector).toBeDefined()
      expect(fieldSelector?.type).toBe('select')

      // Check that options include external context fields
      const options = (fieldSelector as FieldDef & { options?: unknown }).options as Array<{
        value: string
        label: string
      }>
      expect(options).toBeDefined()

      const subscriptionTierOption = options.find((o) => o.value === 'subscriptionTier')
      expect(subscriptionTierOption).toBeDefined()
      expect(subscriptionTierOption?.label).toBe('Subscription Tier')

      const donationCountOption = options.find((o) => o.value === 'donationCount')
      expect(donationCountOption).toBeDefined()
      expect(donationCountOption?.label).toBe('Total Donations')
    })

    it('sets validation error when field references another field that comes after it', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      const fieldA = {
        id: 'field_a',
        type: 'text',
        label: 'Field A'
      }

      const fieldB = {
        id: 'field_b',
        type: 'text',
        label: 'Field B',
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            match: 'all',
            conditions: [
              {
                field: 'field_a',
                operator: 'contains',
                value: 'test'
              }
            ]
          }
        }
      }

      // Reorder: fieldB now comes before fieldA (invalid condition)
      const reorderedFields = [fieldB, fieldA]

      const mockSetFieldError = vi.fn()
      const mockSetFieldTouched = vi.fn()
      const mockSetValue = vi.fn()

      fieldsArray.onChange?.({
        value: reorderedFields,
        values: { fields: reorderedFields },
        root: { fields: reorderedFields },
        setValue: mockSetValue,
        setFieldError: mockSetFieldError,
        setFieldTouched: mockSetFieldTouched,
        path: 'customFields.fields'
      })

      const expectedPath =
        'customFields.fields[0].visibilityConditions.visibleWhen.conditions[0].field'

      const errorCall = mockSetFieldError.mock.calls.find(
        (call: unknown[]) => call[0] === expectedPath
      ) as unknown[]

      expect(errorCall).toBeDefined()
      expect(errorCall[1]).toContain('This field is no longer available')
      expect(mockSetFieldTouched).toHaveBeenCalledWith(expectedPath, true)
      expect(mockSetValue).not.toHaveBeenCalled()
    })

    it('clears validation errors when previously invalid condition becomes valid', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      const fieldA = {
        id: 'field_a',
        type: 'text',
        label: 'Field A'
      }

      const fieldB = {
        id: 'field_b',
        type: 'text',
        label: 'Field B'
      }

      const fieldC = {
        id: 'field_c',
        type: 'text',
        label: 'Field C',
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            match: 'all',
            conditions: [
              {
                field: 'field_a',
                operator: 'contains',
                value: 'test'
              }
            ]
          }
        }
      }

      // Reorder: fieldA is still before fieldC, so condition remains valid
      const reorderedFields = [fieldA, fieldC, fieldB]

      const mockSetFieldError = vi.fn()
      const mockSetFieldTouched = vi.fn()
      const mockSetValue = vi.fn()

      fieldsArray.onChange?.({
        value: reorderedFields,
        values: { fields: reorderedFields },
        root: { fields: reorderedFields },
        setValue: mockSetValue,
        setFieldError: mockSetFieldError,
        setFieldTouched: mockSetFieldTouched,
        path: 'customFields.fields'
      })

      const expectedPath =
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field'
      const call = mockSetFieldError.mock.calls.find(
        (call: unknown[]) => call[0] === expectedPath
      ) as unknown[]

      expect(call).toBeDefined()
      expect(call[1]).toBeUndefined() // Clears error
      expect(mockSetValue).not.toHaveBeenCalled()
    })

    it('sets validation error when referenced field is deleted', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      const fieldB = {
        id: 'field_b',
        type: 'text',
        label: 'Field B',
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            match: 'all',
            conditions: [
              {
                field: 'field_a',
                operator: 'contains',
                value: 'test'
              }
            ]
          }
        }
      }

      // Simulate deletion: remove fieldA
      const fieldsAfterDeletion = [fieldB]

      const mockSetFieldError = vi.fn()
      const mockSetFieldTouched = vi.fn()
      const mockSetValue = vi.fn()

      fieldsArray.onChange?.({
        value: fieldsAfterDeletion,
        values: { fields: fieldsAfterDeletion },
        root: { fields: fieldsAfterDeletion },
        setValue: mockSetValue,
        setFieldError: mockSetFieldError,
        setFieldTouched: mockSetFieldTouched,
        path: 'customFields.fields'
      })

      const expectedPath =
        'customFields.fields[0].visibilityConditions.visibleWhen.conditions[0].field'
      const call = mockSetFieldError.mock.calls.find(
        (call: unknown[]) => call[0] === expectedPath
      ) as unknown[]

      expect(call).toBeDefined()
      expect(call[1]).toContain('This field is no longer available')
      expect(mockSetValue).not.toHaveBeenCalled()
    })

    it('preserves conditions referencing external context when fields are reordered', () => {
      const contextSchema = {
        userTier: {
          label: 'User Tier',
          type: 'string' as const
        }
      }

      const formDef = useCustomFieldsConfigForm(contextSchema)
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      const fieldA = {
        id: 'field_a',
        type: 'text',
        label: 'Field A',
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            match: 'all',
            conditions: [
              {
                field: 'userTier',
                operator: 'in',
                value: ['premium']
              }
            ]
          }
        }
      }

      const fieldB = {
        id: 'field_b',
        type: 'text',
        label: 'Field B'
      }

      // Reorder fields - condition should remain valid because it references external context
      const reorderedFields = [fieldB, fieldA]

      const mockSetFieldError = vi.fn()
      const mockSetFieldTouched = vi.fn()
      const mockSetValue = vi.fn()

      fieldsArray.onChange?.({
        value: reorderedFields,
        values: { fields: reorderedFields },
        root: { fields: reorderedFields },
        setValue: mockSetValue,
        setFieldError: mockSetFieldError,
        setFieldTouched: mockSetFieldTouched,
        path: 'customFields.fields'
      })

      const expectedPath =
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field'
      const call = mockSetFieldError.mock.calls.find(
        (call: unknown[]) => call[0] === expectedPath
      ) as unknown[]

      expect(call).toBeDefined()
      expect(call[1]).toBeUndefined() // Valid - external context is always available
      expect(mockSetValue).not.toHaveBeenCalled()
    })

    it('validates multiple conditions correctly when some are valid and others invalid', () => {
      const formDef = useCustomFieldsConfigForm()
      const fieldsArray = formDef.setup(createMockFormContext()).fields as ArrayFieldDef

      const fieldA = {
        id: 'field_a',
        type: 'text',
        label: 'Field A'
      }

      const fieldB = {
        id: 'field_b',
        type: 'text',
        label: 'Field B',
        enableVisibilityConditions: true,
        visibilityConditions: {
          visibleWhen: {
            match: 'all',
            conditions: [
              {
                field: 'field_a', // Valid - comes before
                operator: 'contains',
                value: 'test'
              },
              {
                field: 'field_c', // Invalid - doesn't exist
                operator: 'equals',
                value: 'value'
              }
            ]
          }
        }
      }

      const fields = [fieldA, fieldB]

      const mockSetFieldError = vi.fn()
      const mockSetFieldTouched = vi.fn()
      const mockSetValue = vi.fn()

      fieldsArray.onChange?.({
        value: fields,
        values: { fields },
        root: { fields },
        setValue: mockSetValue,
        setFieldError: mockSetFieldError,
        setFieldTouched: mockSetFieldTouched,
        path: 'customFields.fields'
      })

      // First condition should be valid
      const validPath =
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field'
      const validCall = mockSetFieldError.mock.calls.find(
        (call: unknown[]) => call[0] === validPath
      ) as unknown[]
      expect(validCall).toBeDefined()
      expect(validCall[1]).toBeUndefined()

      // Second condition should have error
      const invalidPath =
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[1].field'
      const invalidCall = mockSetFieldError.mock.calls.find(
        (call: unknown[]) => call[0] === invalidPath
      ) as unknown[]
      expect(invalidCall).toBeDefined()
      expect(invalidCall[1]).toContain('This field is no longer available')
    })
  })
})
