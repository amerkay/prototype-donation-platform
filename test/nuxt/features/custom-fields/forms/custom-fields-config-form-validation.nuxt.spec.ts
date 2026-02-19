import { describe, expect, it, vi } from 'vitest'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import {
  createFieldReferenceSchema,
  validateCustomFieldConditions
} from '~/features/_library/form-builder/conditions'
import type { AvailableField } from '~/features/_library/form-builder/composables/useAvailableFields'

describe('custom-fields-config-form - Field Reference Validation', () => {
  describe('createFieldReferenceSchema', () => {
    it('accepts references to available fields', () => {
      const availableFields: AvailableField[] = [
        { key: 'field_a', label: 'Field A', type: 'string', group: 'Form Fields' },
        { key: 'field_b', label: 'Field B', type: 'string', group: 'Form Fields' }
      ]

      const schema = createFieldReferenceSchema(availableFields, 'field')

      expect(() => schema.parse('field_a')).not.toThrow()
      expect(() => schema.parse('field_b')).not.toThrow()
    })

    it.each([
      {
        input: 'nonexistent_field',
        error: /This field is no longer available/,
        desc: 'non-existent field'
      },
      {
        input: 'field_b',
        error: /This field is no longer available/,
        desc: 'removed field'
      },
      {
        input: '',
        error: /Field is required/,
        desc: 'empty reference'
      }
    ])('rejects $desc', ({ input, error }) => {
      const availableFields: AvailableField[] = [
        { key: 'field_a', label: 'Field A', type: 'string', group: 'Form Fields' }
      ]

      const schema = createFieldReferenceSchema(availableFields, 'field')

      expect(() => schema.parse(input)).toThrow(error)
    })

    it('accepts references to external context fields', () => {
      const availableFields: AvailableField[] = [
        { key: 'field_a', label: 'Field A', type: 'string', group: 'Form Fields' },
        { key: 'userTier', label: 'User Tier', type: 'string', group: 'External Context' },
        { key: 'isVerified', label: 'Is Verified', type: 'boolean', group: 'External Context' }
      ]

      const schema = createFieldReferenceSchema(availableFields, 'field')

      expect(() => schema.parse('field_a')).not.toThrow()
      expect(() => schema.parse('userTier')).not.toThrow()
      expect(() => schema.parse('isVerified')).not.toThrow()
    })

    it('provides helpful error message explaining why field is unavailable', () => {
      const availableFields: AvailableField[] = [
        { key: 'field_a', label: 'Field A', type: 'string', group: 'Form Fields' }
      ]

      const schema = createFieldReferenceSchema(availableFields, 'field')

      try {
        schema.parse('deleted_field')
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const zodError = error as any
        const message = zodError.errors[0].message

        expect(message).toContain('This field is no longer available')
        expect(message).toContain('It may have been moved below this field, renamed, or removed.')
      }
    })
  })

  describe('validateCustomFieldConditions', () => {
    it('sets error when condition references non-existent field', () => {
      const setFieldError = vi.fn()
      const setFieldTouched = vi.fn()

      const items = [
        { id: 'field_a', type: 'text' },
        {
          id: 'field_b',
          type: 'text',
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'nonexistent_field', operator: 'equals', value: 'test' }]
            }
          }
        }
      ]

      validateCustomFieldConditions(items, undefined, 'customFields.fields', {
        setFieldError,
        setFieldTouched
      })

      expect(setFieldError).toHaveBeenCalledWith(
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field',
        'This field is no longer available. It may have been moved below this field, renamed, or removed.'
      )
    })

    it('clears error when condition references valid preceding field', () => {
      const setFieldError = vi.fn()
      const setFieldTouched = vi.fn()

      const items = [
        { id: 'field_a', type: 'text' },
        {
          id: 'field_b',
          type: 'text',
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'field_a', operator: 'equals', value: 'test' }]
            }
          }
        }
      ]

      validateCustomFieldConditions(items, undefined, 'customFields.fields', {
        setFieldError,
        setFieldTouched
      })

      expect(setFieldError).toHaveBeenCalledWith(
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field',
        undefined
      )
    })

    it('sets error when field references itself', () => {
      const setFieldError = vi.fn()
      const setFieldTouched = vi.fn()

      const items = [
        { id: 'field_a', type: 'text' },
        {
          id: 'field_b',
          type: 'text',
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'field_b', operator: 'equals', value: 'test' }]
            }
          }
        }
      ]

      validateCustomFieldConditions(items, undefined, 'customFields.fields', {
        setFieldError,
        setFieldTouched
      })

      // field_b cannot reference itself (it's not in the preceding fields)
      expect(setFieldError).toHaveBeenCalledWith(
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field',
        'This field is no longer available. It may have been moved below this field, renamed, or removed.'
      )
    })

    it('sets error when field references subsequent field', () => {
      const setFieldError = vi.fn()
      const setFieldTouched = vi.fn()

      const items = [
        {
          id: 'field_a',
          type: 'text',
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'field_b', operator: 'equals', value: 'test' }]
            }
          }
        },
        { id: 'field_b', type: 'text' }
      ]

      validateCustomFieldConditions(items, undefined, 'customFields.fields', {
        setFieldError,
        setFieldTouched
      })

      // field_a at index 0 cannot reference field_b at index 1
      expect(setFieldError).toHaveBeenCalledWith(
        'customFields.fields[0].visibilityConditions.visibleWhen.conditions[0].field',
        'This field is no longer available. It may have been moved below this field, renamed, or removed.'
      )
    })

    it('accepts references to external context fields', () => {
      const setFieldError = vi.fn()
      const setFieldTouched = vi.fn()

      const contextSchema: ContextSchema = {
        userTier: { label: 'User Tier', type: 'string', options: [] }
      }

      const items = [
        {
          id: 'field_a',
          type: 'text',
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'userTier', operator: 'equals', value: 'gold' }]
            }
          }
        }
      ]

      validateCustomFieldConditions(items, contextSchema, 'customFields.fields', {
        setFieldError,
        setFieldTouched
      })

      expect(setFieldError).toHaveBeenCalledWith(
        'customFields.fields[0].visibilityConditions.visibleWhen.conditions[0].field',
        undefined
      )
    })

    it('validates all conditions in a field', () => {
      const setFieldError = vi.fn()
      const setFieldTouched = vi.fn()

      const items = [
        { id: 'field_a', type: 'text' },
        {
          id: 'field_b',
          type: 'text',
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [
                { field: 'field_a', operator: 'equals', value: 'test' },
                { field: 'nonexistent', operator: 'equals', value: 'test' }
              ]
            }
          }
        }
      ]

      validateCustomFieldConditions(items, undefined, 'customFields.fields', {
        setFieldError,
        setFieldTouched
      })

      // First condition valid
      expect(setFieldError).toHaveBeenCalledWith(
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field',
        undefined
      )

      // Second condition invalid
      expect(setFieldError).toHaveBeenCalledWith(
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[1].field',
        'This field is no longer available. It may have been moved below this field, renamed, or removed.'
      )
    })

    it('sets error when field reference is empty', () => {
      const setFieldError = vi.fn()
      const setFieldTouched = vi.fn()

      const items = [
        {
          id: 'field_a',
          type: 'text',
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: '', operator: 'equals', value: 'test' }]
            }
          }
        }
      ]

      validateCustomFieldConditions(items, undefined, 'customFields.fields', {
        setFieldError,
        setFieldTouched
      })

      expect(setFieldError).toHaveBeenCalledWith(
        'customFields.fields[0].visibilityConditions.visibleWhen.conditions[0].field',
        'Field is required'
      )
    })

    it('marks fields as touched when validating', () => {
      const setFieldError = vi.fn()
      const setFieldTouched = vi.fn()

      const items = [
        { id: 'field_a', type: 'text' },
        {
          id: 'field_b',
          type: 'text',
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'field_a', operator: 'equals', value: 'test' }]
            }
          }
        }
      ]

      validateCustomFieldConditions(items, undefined, 'customFields.fields', {
        setFieldError,
        setFieldTouched
      })

      expect(setFieldTouched).toHaveBeenCalledWith(
        'customFields.fields[1].visibilityConditions.visibleWhen.conditions[0].field',
        true
      )
    })

    it('skips fields without visibility conditions enabled', () => {
      const setFieldError = vi.fn()
      const setFieldTouched = vi.fn()

      const items = [
        { id: 'field_a', type: 'text' },
        {
          id: 'field_b',
          type: 'text',
          enableVisibilityConditions: false
        }
      ]

      validateCustomFieldConditions(items, undefined, 'customFields.fields', {
        setFieldError,
        setFieldTouched
      })

      expect(setFieldError).not.toHaveBeenCalled()
      expect(setFieldTouched).not.toHaveBeenCalled()
    })
  })
})
