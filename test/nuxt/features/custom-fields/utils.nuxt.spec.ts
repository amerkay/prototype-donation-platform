import { describe, expect, it } from 'vitest'
import { computed } from 'vue'
import {
  useCustomFieldsForm,
  extractCustomFieldDefaults,
  hasAnyVisibleCustomFields
} from '~/features/_library/custom-fields/utils'
import type { CustomFieldDefinition } from '~/features/_library/custom-fields/types'
import type { FormContext } from '~/features/_library/form-builder/types'

function createMockFormContext(values: Record<string, unknown> = {}): FormContext {
  return {
    values: computed(() => values),
    form: computed(() => values)
  }
}

describe('custom-fields utils', () => {
  describe('useCustomFieldsForm', () => {
    it('returns ComposableForm with customFields id and fields map', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'full_name',
          label: 'Full Name',
          optional: false
        }
      ]

      const formDef = useCustomFieldsForm(customFields)

      expect(formDef.id).toBe('customFields')
      const fields = formDef.setup(createMockFormContext())
      expect(fields.full_name).toBeDefined()
      expect(fields.full_name?.type).toBe('text')
      expect(fields.full_name?.label).toBe('Full Name')
    })

    it.each([
      {
        type: 'text' as const,
        id: 'email',
        label: 'Email',
        placeholder: 'user@example.com',
        optional: false,
        expectedType: 'text'
      },
      {
        type: 'slider' as const,
        id: 'donation_amount',
        label: 'Donation Amount',
        min: 10,
        max: 1000,
        step: 10,
        prefix: '$',
        expectedType: 'slider'
      },
      {
        type: 'select' as const,
        id: 'country',
        label: 'Country',
        options: ['USA', 'Canada', 'UK'],
        expectedType: 'select'
      },
      {
        type: 'checkbox' as const,
        id: 'interests',
        label: 'Interests',
        options: ['Sports', 'Music', 'Art'],
        expectedType: 'checkbox'
      },
      {
        type: 'radio-group' as const,
        id: 'size',
        label: 'Size',
        options: ['Small', 'Medium', 'Large'],
        expectedType: 'radio-group'
      },
      {
        type: 'number' as const,
        id: 'age',
        label: 'Age',
        min: 0,
        max: 120,
        expectedType: 'number'
      },
      {
        type: 'textarea' as const,
        id: 'message',
        label: 'Message',
        rows: 5,
        expectedType: 'textarea'
      },
      {
        type: 'hidden' as const,
        id: 'utm_source',
        label: 'UTM Source',
        defaultValue: 'newsletter',
        expectedType: 'hidden'
      }
    ])('transforms $type field to form-builder FieldDef with type $expectedType', (fieldConfig) => {
      const { expectedType, ...customField } = fieldConfig
      const customFields: CustomFieldDefinition[] = [customField as CustomFieldDefinition]

      const formDef = useCustomFieldsForm(customFields)
      const fields = formDef.setup(createMockFormContext())
      const field = fields[customField.id]

      expect(field).toBeDefined()
      expect(field?.type).toBe(expectedType)
      expect(field?.label).toBe(customField.label)
    })

    it('transforms all fields when multiple provided', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'name', label: 'Name' },
        { type: 'number', id: 'age', label: 'Age' },
        { type: 'select', id: 'country', label: 'Country', options: ['USA', 'Canada'] }
      ]

      const formDef = useCustomFieldsForm(customFields)
      const fields = formDef.setup(createMockFormContext())

      expect(fields.name?.type).toBe('text')
      expect(fields.age?.type).toBe('number')
      expect(fields.country?.type).toBe('select')
    })

    it('returns empty fields map when no fields provided', () => {
      const formDef = useCustomFieldsForm([])
      const fields = formDef.setup(createMockFormContext())

      expect(formDef.id).toBe('customFields')
      expect(fields).toEqual({})
    })

    it('gracefully skips incomplete fields without type', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'name', label: 'Name' },
        { id: 'incomplete', label: 'Incomplete' } as CustomFieldDefinition, // Missing type
        { type: 'number', id: 'age', label: 'Age' }
      ]

      const formDef = useCustomFieldsForm(customFields)
      const fields = formDef.setup(createMockFormContext())

      // Should only include complete fields
      expect(fields.name?.type).toBe('text')
      expect(fields.age?.type).toBe('number')
      expect(fields.incomplete).toBeUndefined()
    })
  })

  describe('extractCustomFieldDefaults', () => {
    it.each([
      {
        type: 'text' as const,
        id: 'country',
        label: 'Country',
        defaultValue: 'USA',
        expected: 'USA'
      },
      {
        type: 'slider' as const,
        id: 'amount',
        label: 'Amount',
        min: 0,
        max: 100,
        defaultValue: 50,
        expected: 50
      },
      {
        type: 'select' as const,
        id: 'size',
        label: 'Size',
        options: ['Small', 'Medium', 'Large'],
        defaultValue: 'medium',
        expected: 'medium'
      },
      {
        type: 'checkbox' as const,
        id: 'interests',
        label: 'Interests',
        options: ['Sports', 'Music'],
        defaultValue: [],
        expected: []
      },
      {
        type: 'number' as const,
        id: 'quantity',
        label: 'Quantity',
        defaultValue: 1,
        expected: 1
      },
      {
        type: 'hidden' as const,
        id: 'tracking_id',
        label: 'Tracking ID',
        defaultValue: 'track_123',
        expected: 'track_123'
      }
    ])('returns $expected for $type field with defaultValue', ({ expected, ...fieldConfig }) => {
      const customFields: CustomFieldDefinition[] = [fieldConfig as CustomFieldDefinition]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults[fieldConfig.id]).toEqual(expected)
    })

    it('returns defaults for all fields when multiple provided', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'name', label: 'Name', defaultValue: 'John' },
        { type: 'number', id: 'age', label: 'Age', defaultValue: 30 },
        { type: 'slider', id: 'rating', label: 'Rating', min: 1, max: 5, defaultValue: 3 }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toEqual({
        name: 'John',
        age: 30,
        rating: 3
      })
    })

    it('returns empty string for text field without explicit default', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'optional_field', label: 'Optional Field' }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults.optional_field).toBe('')
    })

    it('returns undefined for number field without explicit default', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'number', id: 'optional_number', label: 'Optional Number', optional: true }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults.optional_number).toBeUndefined()
    })

    it('returns empty object when no fields provided', () => {
      const defaults = extractCustomFieldDefaults([])

      expect(defaults).toEqual({})
    })

    it('gracefully skips incomplete fields without type', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'name', label: 'Name', defaultValue: 'John' },
        { id: 'incomplete', label: 'Incomplete' } as CustomFieldDefinition, // Missing type
        { type: 'number', id: 'age', label: 'Age', defaultValue: 30 }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      // Should only include complete fields
      expect(defaults).toEqual({
        name: 'John',
        age: 30
      })
      expect(defaults.incomplete).toBeUndefined()
    })
  })

  describe('integration: useCustomFieldsForm + extractDefaults', () => {
    it('produces matching keys in ComposableForm fields and defaults object', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'username', label: 'Username', defaultValue: 'user123' },
        { type: 'slider', id: 'amount', label: 'Amount', min: 0, max: 100, defaultValue: 25 },
        {
          type: 'select',
          id: 'country',
          label: 'Country',
          options: ['USA', 'Canada'],
          defaultValue: 'usa'
        }
      ]

      const formDef = useCustomFieldsForm(customFields)
      const fields = formDef.setup(createMockFormContext())
      const defaults = extractCustomFieldDefaults(customFields)

      // Both functions should create entries for the same field IDs
      const formKeys = Object.keys(fields).sort()
      const defaultKeys = Object.keys(defaults).sort()
      expect(formKeys).toEqual(defaultKeys)
    })

    it('ensures ComposableForm defaultValue matches extracted default', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'username', label: 'Username', defaultValue: 'user123' },
        { type: 'slider', id: 'amount', label: 'Amount', min: 0, max: 100, defaultValue: 25 }
      ]

      const formDef = useCustomFieldsForm(customFields)
      const fields = formDef.setup(createMockFormContext())
      const defaults = extractCustomFieldDefaults(customFields)

      // Verify that what we extract as a default matches what the form field declares
      expect(fields.username?.defaultValue).toBe(defaults.username)
      expect(fields.amount?.defaultValue).toBe(defaults.amount)
    })
  })

  describe('hasAnyVisibleCustomFields', () => {
    it('returns false when no fields provided', () => {
      const hasVisible = hasAnyVisibleCustomFields([])
      expect(hasVisible).toBe(false)
    })

    it('returns true when field has no visibility conditions', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'name',
          label: 'Name',
          optional: false
        }
      ]

      const hasVisible = hasAnyVisibleCustomFields(customFields, {})
      expect(hasVisible).toBe(true)
    })

    it('returns true when field has visibility conditions disabled', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'name',
          label: 'Name',
          optional: false,
          enableVisibilityConditions: false,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'test', operator: 'isTrue' }],
              match: 'all'
            }
          }
        }
      ]

      const hasVisible = hasAnyVisibleCustomFields(customFields, {})
      expect(hasVisible).toBe(true)
    })

    it('returns true when at least one field meets visibility conditions', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'company_name',
          label: 'Company Name',
          optional: false,
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'companyMatch', operator: 'isTrue' }],
              match: 'all'
            }
          }
        }
      ]

      const hasVisible = hasAnyVisibleCustomFields(customFields, { companyMatch: true })
      expect(hasVisible).toBe(true)
    })

    it('returns false when all fields fail visibility conditions', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'company_name',
          label: 'Company Name',
          optional: false,
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'companyMatch', operator: 'isTrue' }],
              match: 'all'
            }
          }
        }
      ]

      const hasVisible = hasAnyVisibleCustomFields(customFields, { companyMatch: false })
      expect(hasVisible).toBe(false)
    })

    it('returns true when any field in a list is visible', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'company_name',
          label: 'Company Name',
          optional: false,
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'companyMatch', operator: 'isTrue' }],
              match: 'all'
            }
          }
        },
        {
          type: 'text',
          id: 'personal_note',
          label: 'Personal Note',
          optional: false,
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'donorLevel', operator: 'in', value: ['gold'] }],
              match: 'all'
            }
          }
        }
      ]

      // First field hidden, second field visible
      const hasVisible = hasAnyVisibleCustomFields(customFields, {
        companyMatch: false,
        donorLevel: 'gold'
      })
      expect(hasVisible).toBe(true)
    })

    it('supports multiple conditions with "all" match', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'company_name',
          label: 'Company Name',
          optional: false,
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [
                { field: 'companyMatch', operator: 'isTrue' },
                { field: 'country', operator: 'in', value: ['US', 'CA'] }
              ],
              match: 'all'
            }
          }
        }
      ]

      // Both conditions must be true
      expect(hasAnyVisibleCustomFields(customFields, { companyMatch: true, country: 'US' })).toBe(
        true
      )
      expect(hasAnyVisibleCustomFields(customFields, { companyMatch: true, country: 'FR' })).toBe(
        false
      )
      expect(hasAnyVisibleCustomFields(customFields, { companyMatch: false, country: 'US' })).toBe(
        false
      )
    })

    it('supports multiple conditions with "any" match', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'special_field',
          label: 'Special Field',
          optional: false,
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [
                { field: 'companyMatch', operator: 'isTrue' },
                { field: 'donorLevel', operator: 'in', value: ['gold'] }
              ],
              match: 'any'
            }
          }
        }
      ]

      // Any condition can be true
      expect(
        hasAnyVisibleCustomFields(customFields, { companyMatch: true, donorLevel: 'bronze' })
      ).toBe(true)
      expect(
        hasAnyVisibleCustomFields(customFields, { companyMatch: false, donorLevel: 'gold' })
      ).toBe(true)
      expect(
        hasAnyVisibleCustomFields(customFields, { companyMatch: false, donorLevel: 'bronze' })
      ).toBe(false)
    })

    it('supports field-to-field visibility conditions', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'first_field',
          label: 'First Field',
          optional: false,
          defaultValue: 'visible'
        },
        {
          type: 'text',
          id: 'second_field',
          label: 'Second Field',
          optional: false,
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'first_field', operator: 'notEmpty' }],
              match: 'all'
            }
          }
        }
      ]

      // Second field depends on first field having a value
      const hasVisible = hasAnyVisibleCustomFields(customFields, {})
      expect(hasVisible).toBe(true) // First field is always visible, and second depends on its default
    })

    it('returns false when no external context provided and all fields require it', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'premium_field',
          label: 'Premium Field',
          optional: false,
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [{ field: 'isPremium', operator: 'isTrue' }],
              match: 'all'
            }
          }
        }
      ]

      const hasVisible = hasAnyVisibleCustomFields(customFields)
      expect(hasVisible).toBe(false)
    })

    it('gracefully skips incomplete fields without type', () => {
      const customFields: CustomFieldDefinition[] = [
        { id: 'incomplete1', label: 'Incomplete 1' } as CustomFieldDefinition, // Missing type
        { id: 'incomplete2', label: 'Incomplete 2' } as CustomFieldDefinition, // Missing type
        {
          type: 'text',
          id: 'complete_field',
          label: 'Complete Field',
          optional: false
        }
      ]

      const hasVisible = hasAnyVisibleCustomFields(customFields, {})
      // Should find the complete field and return true
      expect(hasVisible).toBe(true)
    })

    it('returns false when all fields are incomplete', () => {
      const customFields: CustomFieldDefinition[] = [
        { id: 'incomplete1', label: 'Incomplete 1' } as CustomFieldDefinition, // Missing type
        { id: 'incomplete2', label: 'Incomplete 2' } as CustomFieldDefinition // Missing type
      ]

      const hasVisible = hasAnyVisibleCustomFields(customFields, {})
      expect(hasVisible).toBe(false)
    })
  })
})
