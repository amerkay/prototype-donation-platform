import { describe, expect, it, vi } from 'vitest'
import { createCustomFieldsConfigSection } from '~/features/custom-fields/forms/custom-fields-config-form'
import type {
  ArrayFieldMeta,
  FieldGroupMeta,
  ArrayItemContext,
  FieldMeta
} from '~/features/form-builder/types'

describe('custom-fields-config-form', () => {
  describe('createCustomFieldsConfigSection', () => {
    it('returns FormDef with correct structure', () => {
      const formDef = createCustomFieldsConfigSection()

      expect(formDef.id).toBe('customFields')
      expect(formDef.fields).toHaveProperty('enabled')
      expect(formDef.fields).toHaveProperty('fields')
    })

    it('has enabled toggle field', () => {
      const formDef = createCustomFieldsConfigSection()
      const enabledField = formDef.fields.enabled

      expect(enabledField?.type).toBe('toggle')
      expect(enabledField?.label).toBe('Enable Custom Fields')
    })

    it('has fields array with correct configuration', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(fieldsArray?.type).toBe('array')
      expect(fieldsArray?.label).toBe('Custom Fields')
      expect(fieldsArray).toHaveProperty('itemField')
      expect(typeof fieldsArray?.itemField).toBe('function')
    })

    it('itemField function returns field-group for new field', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(fieldsArray?.type).toBe('array')
      expect(typeof fieldsArray.itemField).toBe('function')

      const emptyValues = {}
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(emptyValues, { index: 0, items: [] })

      expect(fieldGroup.type).toBe('field-group')
      expect(fieldGroup.label).toBe('New Custom Field')
      expect(fieldGroup.collapsible).toBe(true)
      expect(fieldGroup.collapsibleDefaultOpen).toBe(true)
    })

    it('itemField includes type selector', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(typeof fieldsArray.itemField).toBe('function')

      const emptyValues = {}
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(emptyValues, { index: 0, items: [] })

      expect(fieldGroup.fields).toHaveProperty('type')
      expect(fieldGroup.fields?.type?.type).toBe('select')
      expect(fieldGroup.fields?.type?.label).toBe('Field Type')
    })

    it('itemField includes label field', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(typeof fieldsArray.itemField).toBe('function')

      const emptyValues = {}
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(emptyValues, { index: 0, items: [] })

      expect(fieldGroup.fields).toHaveProperty('label')
      expect(fieldGroup.fields?.label?.type).toBe('text')
      expect(fieldGroup.fields?.label?.label).toBe('Field Label')
    })

    it('itemField includes hidden id field', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(typeof fieldsArray.itemField).toBe('function')

      const emptyValues = {}
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(emptyValues, { index: 0, items: [] })

      expect(fieldGroup.fields).toHaveProperty('id')
      expect(fieldGroup.fields?.id?.type).toBe('text')
      expect(fieldGroup.fields?.id?.visibleWhen).toBeDefined()
    })

    it('itemField shows type-specific config for text fields', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(typeof fieldsArray.itemField).toBe('function')

      const textFieldValues = { type: 'text', label: 'Username' }
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(textFieldValues, { index: 0, items: [] })

      expect(fieldGroup.label).toBe('Text: Username')
      expect(fieldGroup.fields).toHaveProperty('advancedSettings')
    })

    it('itemField shows type-specific config for slider fields', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(typeof fieldsArray.itemField).toBe('function')

      const sliderFieldValues = { type: 'slider', label: 'Amount' }
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(sliderFieldValues, { index: 0, items: [] })

      expect(fieldGroup.label).toBe('Slider: Amount')
      expect(fieldGroup.fields).toHaveProperty('min')
      expect(fieldGroup.fields).toHaveProperty('max')
    })

    it('itemField shows type-specific config for select fields', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(typeof fieldsArray.itemField).toBe('function')

      const selectFieldValues = { type: 'select', label: 'Country' }
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(selectFieldValues, { index: 0, items: [] })

      expect(fieldGroup.label).toBe('Select: Country')
      expect(fieldGroup.fields).toHaveProperty('options')
    })

    it('truncates long labels in display', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(typeof fieldsArray.itemField).toBe('function')

      const longLabelValues = {
        type: 'text',
        label: 'This is a very long label that should be truncated to prevent UI issues'
      }
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(longLabelValues, { index: 0, items: [] })

      expect(fieldGroup.label).toContain('Text: This is a very long label')
      expect(fieldGroup.label).toContain('...')
      expect(fieldGroup.label?.length).toBeLessThan(50)
    })

    it('handles empty label gracefully', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(typeof fieldsArray.itemField).toBe('function')

      const noLabelValues = { type: 'text', label: '' }
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(noLabelValues, { index: 0, items: [] })

      expect(fieldGroup.label).toBe('Text')
    })

    it('array field is visible only when enabled', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields

      expect(fieldsArray?.visibleWhen).toBeDefined()

      if (fieldsArray?.visibleWhen && typeof fieldsArray.visibleWhen === 'function') {
        expect(fieldsArray.visibleWhen({ values: { enabled: true }, root: {} })).toBe(true)
        expect(fieldsArray.visibleWhen({ values: { enabled: false }, root: {} })).toBe(false)
      }
    })

    it('array field is sortable', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields

      expect(fieldsArray).toHaveProperty('sortable', true)
    })

    it('has appropriate button text', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields

      expect(fieldsArray).toHaveProperty('addButtonText', 'Add Custom Field')
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

      const formDef = createCustomFieldsConfigSection(contextSchema)
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      // Get the itemField function and call it with a text field config
      const textFieldValues = { type: 'text', label: 'Test Field', id: 'test_field' }
      const fieldGroup = (
        fieldsArray.itemField as (
          v: Record<string, unknown>,
          ctx: ArrayItemContext
        ) => FieldGroupMeta
      )(textFieldValues, { index: 0, items: [textFieldValues] })

      // Navigate to visibility conditions
      const visibilityConditions = fieldGroup.fields?.visibilityConditions as FieldGroupMeta
      expect(visibilityConditions).toBeDefined()
      expect(visibilityConditions.type).toBe('field-group')

      const visibleWhen = visibilityConditions.fields?.visibleWhen as FieldGroupMeta
      expect(visibleWhen).toBeDefined()

      const conditions = visibleWhen.fields?.conditions as ArrayFieldMeta
      expect(conditions).toBeDefined()
      expect(conditions.type).toBe('array')

      // Get a condition item to check field options
      const conditionItemField =
        typeof conditions.itemField === 'function'
          ? conditions.itemField({}, { index: 0, items: [] })
          : conditions.itemField

      expect(conditionItemField.type).toBe('field-group')

      const fieldSelector = (conditionItemField as FieldGroupMeta).fields?.field
      expect(fieldSelector).toBeDefined()
      expect(fieldSelector?.type).toBe('select')

      // Check that options include external context fields
      const options = (fieldSelector as FieldMeta & { options?: unknown }).options as Array<{
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

    it('clears invalid condition references when fields are reordered', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(fieldsArray.onChange).toBeDefined()
      expect(typeof fieldsArray.onChange).toBe('function')

      // Create two fields: fieldA and fieldB where fieldB has a condition referencing fieldA
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
                field: 'field_a', // References fieldA
                operator: 'equals',
                value: 'test'
              }
            ]
          }
        }
      }

      // Simulate reordering: move fieldB before fieldA (making the condition invalid)
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

      // Should set error on the invalid condition field
      // Logic: fieldB is now at index 0, so precedingFields is empty.
      // But fieldB references 'field_a'. 'field_a' is not in precedingFields (it's at index 1 now).
      expect(mockSetFieldError).toHaveBeenCalled()
      expect(mockSetFieldTouched).toHaveBeenCalled()

      // The path format should be: customFields.fields[index].visibilityConditions.visibleWhen.conditions[cIndex].field
      // fieldB is at index 0. The condition is at index 0.
      const expectedPath =
        'customFields.fields[0].visibilityConditions.visibleWhen.conditions[0].field'

      const calls = mockSetFieldError.mock.calls
      const errorCall = calls.find((call: unknown[]) => call[0] === expectedPath) as unknown[]

      expect(errorCall).toBeDefined()
      expect(errorCall[1]).toContain('This field is no longer available')

      // Should not mutate values anymore
      expect(mockSetValue).not.toHaveBeenCalled()
    })

    it('preserves valid conditions when fields are reordered but remain valid', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(fieldsArray.onChange).toBeDefined()

      // Create three fields: A, B, C where C has a condition referencing A
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
                field: 'field_a', // References fieldA
                operator: 'equals',
                value: 'test'
              }
            ]
          }
        }
      }

      // Swap fieldB and fieldC - fieldA is still before fieldC, so condition remains valid
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

      // Should verify valid fields and clear errors if any existed
      expect(mockSetFieldError).toHaveBeenCalled()

      // Check that it calls setFieldError with undefined for valid fields
      const expectedPath =
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field'
      const call = mockSetFieldError.mock.calls.find(
        (call: unknown[]) => call[0] === expectedPath
      ) as unknown[]

      expect(call).toBeDefined()
      expect(call[1]).toBeUndefined() // Clears error

      expect(mockSetValue).not.toHaveBeenCalled()
    })

    it('flags condition as error when referenced field is deleted', () => {
      const formDef = createCustomFieldsConfigSection()
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(fieldsArray.onChange).toBeDefined()

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
                field: 'field_a', // References fieldA
                operator: 'equals',
                value: 'test'
              }
            ]
          }
        }
      }

      // Simulate deletion: remove fieldA, leaving only fieldB
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

      // Should set error on the invalid condition field
      expect(mockSetFieldError).toHaveBeenCalled()

      const expectedPath =
        'customFields.fields[0].visibilityConditions.visibleWhen.conditions[0].field'
      const call = mockSetFieldError.mock.calls.find(
        (call: unknown[]) => call[0] === expectedPath
      ) as unknown[]

      expect(call).toBeDefined()
      expect(call[1]).toContain('This field is no longer available')

      // Should not mutate values
      expect(mockSetValue).not.toHaveBeenCalled()
    })

    it('preserves conditions referencing external context when fields are reordered', () => {
      const contextSchema = {
        userTier: {
          label: 'User Tier',
          type: 'string' as const
        }
      }

      const formDef = createCustomFieldsConfigSection(contextSchema)
      const fieldsArray = formDef.fields.fields as ArrayFieldMeta

      expect(fieldsArray.onChange).toBeDefined()

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
                field: 'userTier', // References external context
                operator: 'equals',
                value: 'premium'
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

      // Should check errors but clear them since they are valid
      expect(mockSetFieldError).toHaveBeenCalled()

      const expectedPath =
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field'
      const call = mockSetFieldError.mock.calls.find(
        (call: unknown[]) => call[0] === expectedPath
      ) as unknown[]

      expect(call).toBeDefined()
      expect(call[1]).toBeUndefined() // Valid

      expect(mockSetValue).not.toHaveBeenCalled()
    })
  })
})
